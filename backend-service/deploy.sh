gcloud builds submit --tag gcr.io/skoratech2024/backend-service 
gcloud run deploy backend-service --image gcr.io/skoratech2024/backend-service --platform managed --memory 4Gi