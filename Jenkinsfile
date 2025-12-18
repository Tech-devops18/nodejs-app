pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "irfancareers18/nodejs-container"
        DOCKER_TAG   = "${BUILD_NUMBER}"
		ANSIBLE_IP = "172.31.25.204"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'cicd-ansi-docker',
                    credentialsId: 'github-account',
                    url: 'https://github.com/Tech-devops18/nodejs-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
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
                
                sudo mv /tmp/ansible /opt/ansible &&
				sudo rm -rf /tmp/ansible &&
				sudo chown -R ubuntu:ubuntu /opt/ansible &&
                sudo ansible-playbook /opt/ansible/deploy.yml \
                  -i /opt/ansible/hosts
              '
            """
        }
    }
}

    }
}
