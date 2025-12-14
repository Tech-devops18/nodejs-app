pipeline {
    agent any

    tools {
        nodejs 'NODEJS'
        jdk 'JAVA_HOME'
    }

    environment {
        APP_DIR = "/opt/nodejs-app"
        SERVER = "172.31.65.249"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Tech-devops18/nodejs-app.git'
            }
        }

        stage('Verify package.json') {
    steps {
        sh '''
            echo "Checking for package.json..."

            if [ -f package.json ]; then
                echo "package.json file is available"
            else
                echo "package.json not found"
                exit 1
            fi

            echo "Validating package.json syntax..."
            node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"

            echo "package.json syntax is valid"
        '''
    }
}


        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to Node Server') {
            steps {
                sshagent(credentials: ['nodejs']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${SERVER} 'sudo mkdir -p ${APP_DIR} && sudo chown -R ubuntu ${APP_DIR}'
                        rsync -avz --delete . ubuntu@${SERVER}:${APP_DIR}
                        ssh -o StrictHostKeyChecking=no ubuntu@${SERVER} '
                            cd ${APP_DIR} &&
                            sudo npm install &&
                            pm2 restart app || pm2 start index.js --name app
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully"
        }
    }
}
