/* groovylint-disable VariableTypeRequired */
pipeline {
    agent any

    parameters {
        choice(
            name: 'entornoDespliegue',
            choices: ['DESARROLLO', 'CERTIFICACION', 'PRODUCCION'],
            description: 'Entorno de despliegue'
        )
        string(
            name: 'RAMA_DESPLIEGUE',
            defaultValue: 'develop',
            description: 'Rama desde la que se desplegará (ej: main, develop, feature/xyz)'
        )
    }

    options {
        skipDefaultCheckout(true)
    }

    environment {
        project = 'prueba_calculator'
    }

    stages {

        stage('Checkout desde GitHub') {
            steps {
                script {
                    cleanWs()

                    echo "Rama seleccionada: ${params.RAMA_DESPLIEGUE}"
                    echo "Entorno seleccionado: ${params.entornoDespliegue}"

                    git branch: params.RAMA_DESPLIEGUE,
                        credentialsId: 'administradorCNIG',
                        url: "https://github.com/administradorcnig/${project}.git"
                }
            }
        }

        // ⭐ NUEVO STAGE: aquí sabremos EN QUÉ MÁQUINA se está ejecutando el job
        stage('Info del nodo y su IP') {
            steps {
                sh '''
                echo "======================================"
                echo "NODO donde se está ejecutando el build"
                echo "======================================"
                echo ""
                echo "Hostname del nodo:"
                hostname
                echo ""
                echo "IPs del nodo:"
                hostname -I || ip addr || ifconfig || echo "No se puede obtener IP"
                echo ""
                echo "IMPORTANTE:"
                echo "Accede a tu aplicación en: http://<IP_QUE_SALGA_AQUI>:8081/"
                echo "======================================"
                '''
            }
        }

        stage('Debug index.html en workspace') {
            steps {
                sh '''
                echo "Contenido del botón en public/index.html (workspace):"
                grep -n 'button id="four"' public/index.html || echo "No se encontró el botón"
                '''
            }
        }

        stage('Install dependencies') {
            steps {
                sh '''
                docker run --rm \
                  -e https_proxy=http://192.168.192.11:8080 \
                  -e http_proxy=http://192.168.192.11:8080 \
                  -e no_proxy=127.0.0.1,localhost,10.0.0.0/8,192.0.0.0/8 \
                  -v "$PWD":/app \
                  -w /app \
                  node:18 \
                  npm install
                '''
            }
        }

        stage('Build Docker image') {
            steps {
                script {
                    def imageTag = env.BUILD_NUMBER

                    sh """
                    docker build \
                      --no-cache \
                      -t poc-calculator:${imageTag} \
                      -t poc-calculator:latest \
                      .
                    """

                    env.IMAGE_TAG = imageTag
                }
            }
        }

        // Debug dentro de la imagen
        stage('Debug index.html en imagen') {
            steps {
                sh '''
                echo "Buscando el botón dentro de la imagen poc-calculator:latest..."
                docker run --rm poc-calculator:latest \
                  sh -c "grep -R 'button id=\"four\"' -n . || echo 'No se encontró en la imagen'"
                '''
            }
        }

        stage('Run app container') {
            steps {
                script {
                    sh 'docker stop poc-calculator || true'

                    sh """
                    docker run -d \
                      --name poc-calculator \
                      --rm \
                      -p 8081:3000 \
                      poc-calculator:${IMAGE_TAG}
                    """
                }
            }
        }

        // Debug en contenedor + curl HTTP
        stage('Debug index.html en contenedor y respuesta HTTP') {
            steps {
                sh '''
                echo "===== Contenido dentro del CONTENEDOR ====="
                docker exec poc-calculator \
                  sh -c "grep -R 'button id=\"four\"' -n . || echo 'No se encontró en contenedor'"

                echo ""
                echo "===== Contenido en RESPUESTA HTTP (curl) ====="
                curl -s http://localhost:8081 | grep -n 'button id="four"' || echo "No se encontró en la respuesta HTTP"
                '''
            }
        }

    }

    post {
        always {
            sh 'docker stop poc-calculator || true'

            cleanWs(cleanWhenNotBuilt: false,
                deleteDirs: true,
                disableDeferredWipeout: true,
                notFailBuild: true,
                patterns: [[pattern: '.gitignore', type: 'INCLUDE'],
                           [pattern: '.propsfile', type: 'EXCLUDE']])
        }
    }
}
