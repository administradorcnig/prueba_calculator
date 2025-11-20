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
    }

    post {
        always {
            sh 'docker stop poc-calculator || true'
        }
    }
}
