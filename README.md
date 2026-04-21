# StyleSense AI

StyleSense AI is a fashion recommendation app with:

- a React + Vite frontend
- an Express backend
- MongoDB for staff and inventory data
- Cloudinary for product images
- MediaPipe Pose for body detection
- Groq for outfit suggestions

## Routes

- `/` landing page
- `/customer` body scan + recommendations
- `/store/login` staff login
- `/store/register` staff registration
- `/store` store inventory dashboard

## Environment Variables

Frontend:

```env
VITE_API_URL=http://localhost:3001
```

Backend:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GROQ_API_KEY=your_groq_api_key
STAFF_JWT_SECRET=replace_this_in_production
```

## Local Development

```bash
npm install
npm run server
npm run dev
```

The frontend defaults to `http://localhost:3001` when `VITE_API_URL` is not set.

## Notes

- Store dashboards now load only the logged-in store's inventory.
- Inventory mutation routes now enforce store ownership on the backend.
- The app uses MongoDB `_id` values consistently across the frontend and backend.
