# MeetNYC

MeetNYC is an Express, Handlebars, and MongoDB web app for finding and sharing NYC events.

## Setup

Install dependencies:

```bash
npm install
```

Make sure MongoDB is running locally, then seed the database:

```bash
npm run seed
```

Start the app:

```bash
npm start
```

Open:

```bash
http://localhost:3000
```

## Demo Accounts

Admin:

```text
Email: admin@meetnyc.local
Password: AdminPass1!
```

Regular user:

```text
Email: demo@meetnyc.local
Password: DemoPass1!
```

Additional regular users can be created from the register page.

## Datasets

NYC Parks Special Events:

```text
https://data.cityofnewyork.us/Recreation/Parks-Special-Events/6v4b-5gp4
```

NYC Permitted Event Information:

```text
https://data.cityofnewyork.us/City-Government/NYC-Permitted-Event-Information/tvpp-9vvx
```

## Features

- Register, log in, and log out
- Edit or delete your profile
- Browse and search events by borough, category, date, and time
- Create, edit, and delete your own events
- RSVP to events with AJAX
- Save and unsave events
- Comment on events with AJAX
- Report events and comments for admin review
- Review events with ratings
- Profile page with created, RSVP'd, and saved events
- Admin dashboard for flagged content
- MongoDB data layer with event subdocuments
- XSS cleaning for user-submitted content
