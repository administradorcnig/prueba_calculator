pipeline {
    agent any

    stages {
        stage('Install dependencies') {
            steps {
                sh '''
                docker run --rm \
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
    }
}
