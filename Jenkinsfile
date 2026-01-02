pipeline {
    agent any

    environment {
        IMAGE_NAME  = "irfancareers18/nodejs-container"
        IMAGE_TAG   = "${BUILD_NUMBER}"
        GITOPS_REPO = "https://github.com/Tech-devops18/GitOps-work1818.git"
        GIT_BRANCH  = "argocd"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: "argocd", url: "https://github.com/Tech-devops18/nodejs-app.git"
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

        stage('Build Docker Image') {
            steps {
                sh '''
                whoami
                docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh """
                    trivy image \
                    --severity HIGH,CRITICAL \
                    --exit-code 0 \
                    ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Login to DockerHub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub1',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Tag and Push Docker Image') {
            steps {
                sh """
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${IMAGE_NAME}:latest
                """
            }
        }

        stage('Update GitOps Repo') {
            steps {
                sh """
                    rm -rf gitops
                    git clone ${GITOPS_REPO} gitops
                    cd gitops
                    git checkout ${GIT_BRANCH}

                    sed -i 's|image: ${IMAGE_NAME}:.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|g' deployment.yaml

                    git config user.email "irfancareers18@gmail.com"
                    git config user.name "irfan"
                    git add deployment.yaml
                    git commit -m "Update image tag to ${IMAGE_TAG}"
                    git push https://${GIT_USER}:${GIT_PASS}@${GITOPS_REPO} ${GIT_BRANCH}
                """
            }
        }
    }

    post {
        success {
            echo "CI completed successfully. Argo CD will handle deployment."
        }
        failure {
            echo "Pipeline failed."
        }
    }
}
