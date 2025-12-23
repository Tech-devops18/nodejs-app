pipeline {
    agent { label 'jenkins-agent-1' }

// tools {
//        sonarScanner 'sonar-scanner'
//    }

    environment {
		SONAR_HOME = tool "sonar-scanner"
        DOCKER_IMAGE = "irfancareers18/nodejs-container"
        DOCKER_TAG   = "${BUILD_NUMBER}"
		ANSIBLE_IP = "172.31.25.204"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'cicd-codecheck',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/Tech-devops18/nodejs-app.git'
            }
        }

		stage('Install Dependencies') {
            steps {
                sh '''
                  npm install
                '''
            }
        }

        stage('Agent Check') {
            steps {
                sh '''
                  echo "Node: $NODE_NAME"
                  $SONAR_HOME/bin/sonar-scanner --version
                '''
            }
        }

		stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                      $SONAR_HOME/bin/sonar-scanner \
                      -Dsonar.projectKey=nodejs-app \
                      -Dsonar.sources=. \
                      -Dsonar.language=js \
                      -Dsonar.nodejs.executable=node \
                      -Dsonar.exclusions=node_modules/**,Dockerfile
                    '''
                }
            }
        }

		stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
		
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
            }
        }

		stage('Trivy Image Scan') {
            steps {
                sh '''
                  trivy image --severity HIGH,CRITICAL --exit-code 1 ${DOCKER_IMAGE}:${DOCKER_TAG}
                '''
            }
        }

        stage('Docker Tag') {
            steps {
				sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:${DOCKER_TAG}"
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

		stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                sh "docker push ${DOCKER_IMAGE}:latest"
            }
        }

		stage('Deploy using Ansible') {
    		steps {
        	sshagent(['ansible-host']) {
            sh """
              scp -o StrictHostKeyChecking=no -r ansible ubuntu@${ANSIBLE_IP}:/tmp/ansible

              ssh -o StrictHostKeyChecking=no ubuntu@${ANSIBLE_IP} '
                sudo rm -rf /opt/ansible &&
                sudo mv /tmp/ansible /opt/ansible &&
				sudo rm -rf /tmp/ansible &&
                ansible-playbook /opt/ansible/deploy.yml \
                  -i /opt/ansible/hosts
              '
            """
        }
    }
}

    }
}
