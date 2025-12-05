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
        // Nos saltamos el checkout por defecto ya que vamos a eliminar el workspace
        skipDefaultCheckout(true)
    }

    environment {
        // Nombre del proyecto/repositorio de GitHub
        // Ajusta esto si tu repo se llama distinto
        project = 'prueba_calculator'
    }

    stages {
        stage('Checkout desde GitHub') {
            steps {
                script {
                    // Limpiamos el workspace
                    cleanWs()

                    echo "Rama seleccionada: ${params.RAMA_DESPLIEGUE}"
                    echo "Entorno seleccionado: ${params.entornoDespliegue}"

                    // Descargar el repositorio desde GitHub
                    // Usa tus credenciales 'administradorCNIG' como en el ejemplo que te funciona
                    git branch: params.RAMA_DESPLIEGUE,
                        credentialsId: 'administradorCNIG',
                        url: "https://github.com/administradorcnig/${project}.git"
                }
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
                sh '''
                docker build -t poc-calculator .
                '''
            }
        }

        stage('Run app container') {
            steps {
                sh '''
                docker run -d \
                  --name poc-calculator \
                  --rm \
                  -p 8081:3000 \
                  poc-calculator
                '''
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
