pipeline {
    agent any

    stages {
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
    }

    post {
        always {
            // Intentamos parar el contenedor; si no existe, no pasa nada
            sh 'docker stop poc-calculator || true'
        }
    }
}
