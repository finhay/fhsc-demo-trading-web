pipeline {
    agent any
    environment {
        BRANCH_NAME = "${GIT_BRANCH.split("/")[1]}"
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    env.K8SCLS = 'STG-On-Premise-cls0'
                    env.WORKSPACE = 'stg'
                    env.DOCKERFILE = 'Dockerfile'
                    env.DEPLOYMENT = 'demo-stg-trading-web'
                    env.IMAGES = 'demo-stg-trading-web'
                    env.URL_PRIVATE_REGISTRY = 'registry.vnsc.vn'
                    echo "pipline for stg: $WORKSPACE , $DOCKERFILE , $DEPLOYMENT , $IMAGES ,$URL_PRIVATE_REGISTRY "
                
                }
            }
        }
        stage('load env') {
            steps {
                script {
                    try {
                        if ("$WORKSPACE"=="stg") {
                            sh '''
                                sudo cp ../demo-stg-update-env/demo-trading-web/stg.env ./.env
                                ls -lah
                            '''
                        }
                    }
                    catch (err) {
                        currentBuild.result = "FAILED"
                        throw err
                    }
                }
            }
	    }
        stage('Build and upload image') {
            steps {
                script {
                    try {
                        sh 'bash ./cicd/build_image.sh $WORKSPACE ${IMAGES}  $BUILD_NUMBER ${URL_PRIVATE_REGISTRY}'
                        sh 'sudo docker images "${URL_PRIVATE_REGISTRY}/${WORKSPACE}-${IMAGES}" --digests'
                    }
                    catch (err) {
                        currentBuild.result = "FAILED"
                        throw err
                    }
                }
            }
	    }

        stage('Promote to Deployment') {
            steps {
                script {
                    try {
                        sh 'bash ./cicd/update_image_to_service_on_k8s.sh $WORKSPACE ${DEPLOYMENT} $BUILD_NUMBER ${URL_PRIVATE_REGISTRY} $K8SCLS'
                    }
                    catch (err) {
                        currentBuild.result = "FAILED"
                        throw err
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                // Extract git commit information
                env.GIT_COMMIT_MSG = sh (script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
                env.GIT_AUTHOR = sh (script: 'git log -1 --pretty=%an ${GIT_COMMIT}', returnStdout: true).trim()

                // Determine build status
                def buildStatus = currentBuild.result ?: 'SUCCESS'

                // Build environment name
                def environment = "${params.K8SCLS}-${WORKSPACE}"

                echo "Sending card-based notification to Google Chat..."
                echo "Status: ${buildStatus}"
                echo "Build: ${BUILD_NUMBER}"
                echo "Image: ${IMAGES}"
                echo "Environment: ${environment}"
                echo "Commit: ${GIT_COMMIT_MSG}"
                echo "Author: ${GIT_AUTHOR}"
                echo "Branch: ${BRANCH_NAME}"
                echo "URL: ${BUILD_URL}"

                // Send card-based notification
                // Parameters: BUILD_STATUS BUILD_NUMBER IMAGE_NAME ENVIRONMENT COMMIT_MESSAGE BUILD_URL GIT_AUTHOR BRANCH_NAME
                sh """
                    bash ./cicd/send-noti-to-ggchat.sh \
                        '${buildStatus}' \
                        '${BUILD_NUMBER}' \
                        '${IMAGES}' \
                        '${environment}' \
                        '${GIT_COMMIT_MSG}' \
                        '${BUILD_URL}' \
                        '${GIT_AUTHOR}' \
                        '${BRANCH_NAME}'
                """
            }
        }
        // success {
    }
}