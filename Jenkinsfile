pipeline {
    agent any

    parameters {
        // Campo de texto para escribir la rama de GitHub
        string(
            name: 'GIT_BRANCH',
            defaultValue: 'main',
            description: 'Escribe la rama de GitHub desde la que quieres desplegar (ej: main, develop, feature/xyz)'
        )

        // Entorno de despliegue (solo visual, sigue siendo un desplegable)
        choice(
            name: 'DEPLOY_ENV',
            choices: 'dev\npre\nprod',
            description: 'Selecciona el entorno de despliegue (solo informativo)'
        )
    }

    stages {

        stage('Checkout código') {
            steps {
                script {
                    echo "Rama seleccionada: ${params.GIT_BRANCH}"
                    echo "Entorno seleccionado: ${params.DEPLOY_ENV}"

                    // Ajusta la URL del repo y credenciales si hace falta
                    git branch: "${params.GIT_BRANCH}",
                        url: 'https://github.com/tu-organizacion/tu-repo.git'
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

        stage('Unit tests') {
            steps {
                sh '''
                docker run --rm \
                  -v "$PWD":/app \
                  -w /app \
                  node:18 \
                  npm test
                '''
            }
        }

        stage('Integration tests (Testcontainers)') {
            steps {
                sh '''
                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  -v "$PWD":/app \
                  -w /app \
                  node:22 \
                  npx mocha tests/integration/testcontainers.spec.js
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

        stage('API tests (Newman)') {
            steps {
                sh '''
                docker run --rm \
                  --network host \
                  -v "$PWD/tests/postman":/etc/newman \
                  postman/newman \
                  run /etc/newman/calculator.postman_collection.json
                '''
            }
        }

        stage('E2E tests (Cypress)') {
            steps {
                sh '''
                docker run --rm \
                  --network host \
                  -v "$PWD":/e2e \
                  -w /e2e \
                  cypress/included:13.6.2 \
                  npx cypress run --spec "cypress/e2e/calculator.cy.js"
                '''
            }
        }

        stage('Load tests (k6)') {
            steps {
                sh '''
                docker run --rm \
                  --network host \
                  -v "$PWD/tests/k6":/scripts \
                  grafana/k6 \
                  run /scripts/complex_loadtest.js
                '''
            }
        }
    }

    post {
        always {
            sh 'docker stop poc-calculator || true'
        }
    }
}
