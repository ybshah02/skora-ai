gcloud builds submit --tag gcr.io/skoratech2024/frontend-service
gcloud run deploy frontend-service --image gcr.io/skoratech2024/frontend-service --platform managed --memory 4Gi