services:
  # Frontend service
  - type: web
    name: zodiac-web
    env: node
    buildCommand: npm install && npm run build
    startCommand: node server.js
    envVars:
      - key: PORT
        value: 10000
      - key: VITE_SUPABASE_URL
        value: your_supabase_url
      - key: VITE_SUPABASE_API_KEY  
        value: your_supabase_anon_key

  # Backend service  
  - type: web
    name: zodiac-api
    env: python
    buildCommand: pip install -r api/requirements.txt
    startCommand: gunicorn --chdir api server:app
    envVars:
      - key: REDIS_HOST
        value: redis-18791.c264.ap-south-1-1.ec2.redns.redis-cloud.com
      - key: REDIS_PORT
        value: 18791
      - key: BOT_TOKEN
        value: 7693246799:AAF30PjRnkpRDowNL58IDrRdW7ALs2VLTGA
