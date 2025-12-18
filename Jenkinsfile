pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "irfancareers18/nodejs-container"
        DOCKER_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'cicd-ansi-docker', credentialsId: 'github-account', url: 'https://github.com/Tech-devops18/nodejs-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker build -t ${DOCKER_IMAGE}/nodejs:${DOCKER_TAG}  .
                }
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

        stage('Docker Tag') {
            steps {
                script {
		    sh "docker tag ${DOCKER_IMAGE}/nodejs:${DOCKER_TAG} ${DOCKER_IMAGE}/nodejs:${DOCKER_TAG}"
            sh "docker tag ${DOCKER_IMAGE}/nodejs:${DOCKER_TAG} ${DOCKER_IMAGE}/nodejs:latest"
                }
            }
        }

	stage('Push Docker Image') {
            steps {
                script {
                    sh "docker push ${DOCKER_IMAGE}/nodejs:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}/nodejs:latest"
                }
            }
        }

#        stage('Deploy using Ansible') {
#            steps {
#               sshagent(['docker-server-ssh']) {
#                    sh """
#                      ansible-playbook ansible/deploy.yml \
#                      -i ansible/inventory \
#                      --extra-vars "image=${DOCKER_IMAGE}:latest"
#                    """
#                }
#            }
#        }
#    }
#}
