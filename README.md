# Mac Applic International School Website

A fully responsive, feature-rich website for Mac Applic International School with a **fully embedded admin dashboard**. Everything runs from a single HTML file — no separate admin pages needed!

## 🌟 Features

### Website
- **Home**: Hero section with animated stats, scroll indicator, and call-to-action buttons
- **About**: Mission, vision, values with enhanced content sections
- **Programs**: 6 comprehensive program cards (Primary, Secondary, Science, Arts, Sports, Languages)
- **Gallery**: Filterable image gallery with categories (Events, Classes, Sports) and lightbox
- **Teachers**: Enhanced teacher profiles with contact links, qualifications, and bio
- **Reviews**: Parent testimonials with 5-star ratings and review statistics
- **Contact**: Multi-channel contact information with social links and form
- **Dark/Light Mode**: Persistent theme toggle
- **Mobile Responsive**: Full mobile navigation and responsive layouts

### Admin Dashboard
- **Secure Login**: Cookie-based authentication system
- **Overview Panel**: KPIs, recent messages, and quick stats
- **Messages Panel**: View all contact form submissions with search and refresh
- **Live Chat**: Real-time chat system with multiple channels (General, Parents, Staff, Visitors)
  - Emoji picker
  - Message history (localStorage)
  - Auto-replies simulation
- **Teachers Panel**: Manage teacher profiles (view, edit, delete)
- **Students Panel**: Enrollment statistics and grade breakdown
- **Settings**: Password change, notification preferences
- **Dark Mode Support**: Full dashboard dark theme

## 🎨 Design Assets

All graphics are generated as SVGs (no external image dependencies):
- `images/logo.svg` - School logo with geometric design
- `images/teacher1.svg` - Mr. Mohammed avatar
- `images/teacher2.svg` - Ms. Muna avatar
- `images/teacher3.svg` - Mr. Ibrahim avatar

## 🚀 Quick Start

**Prerequisites**: Install [Node.js](https://nodejs.org/) (v14 or higher)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Server**:
   ```bash
   npm start
   ```

3. **Access Website**:
   - Main website: **http://localhost:3000**
   - Click the **🔐 Admin** button in the navigation (or footer) to open the admin modal

## 🔐 Admin Access

The admin system is **fully embedded** in the main website:

1. Click the **🔐 Admin** link in the top navigation or footer
2. A login modal will appear (no page navigation!)
3. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
4. The full admin dashboard will overlay on top of the website
5. Click **"✕ Exit"** in the top-right to return to the main site

**To customize credentials**, set environment variables:
```bash
ADMIN_USER=myusername ADMIN_PASS=mypassword npm start
```

## 📁 Project Structure

```
###''@@@/
├── index.html           # Main website
├── mac.css              # Website styles
├── mac.js               # Website JavaScript
├── server.js            # Express server with auth
├── package.json         # Node dependencies
├── admin/
│   ├── login.html       # Admin login page
│   ├── dashboard.html   # Admin dashboard
│   ├── admin.css        # Admin styles
│   ├── login.js         # Login functionality
│   └── dashboard.js     # Dashboard functionality
├── images/
│   ├── logo.svg         # School logo
│   ├── teacher1.svg     # Teacher avatar 1
│   ├── teacher2.svg     # Teacher avatar 2
│   └── teacher3.svg     # Teacher avatar 3
└── messages.json        # Contact form submissions (auto-created)
```

## 📬 Contact Form

Submissions are stored in `messages.json` and viewable in the admin dashboard. The form includes:
- Name validation
- Email validation
- Subject line (optional)
- Message content
- Timestamp

## 💬 Live Chat Features

The admin dashboard includes a real-time chat system:
- **Multiple Channels**: General, Parents Group, Staff Room, Website Visitors
- **Message History**: Persisted in browser localStorage
- **Emoji Support**: Quick emoji picker for expressive messaging
- **Auto-Reply**: Simulated responses for testing
- **Search Contacts**: Filter chat channels
- **Clear Chat**: Reset channel history

## 🎯 Key Technologies

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: CSS3 with custom properties
- **Storage**: File-based (messages.json) + localStorage (chat)
- **Auth**: Cookie-based sessions

## 🔧 Customization

### Change School Information
Edit `index.html` to update:
- School name, contact details, addresses
- Teacher profiles and subjects
- Program descriptions
- Gallery images and categories

### Styling
Edit `mac.css` for the website or `admin/admin.css` for dashboard:
- Color scheme (CSS variables in `:root`)
- Fonts, spacing, layouts
- Dark mode overrides

### Admin Features
Extend `server.js` to add:
- Database integration
- Email notifications
- File uploads
- Additional API endpoints

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+ (full experience)
- **Tablet**: 768px - 1199px (adjusted layouts)
- **Mobile**: < 768px (hamburger menu, stacked sections)

## 🌙 Dark Mode

Dark mode is available on both the website and admin dashboard:
- Toggle via moon/sun button in header
- Preference saved in localStorage
- Applies system-wide on next visit

## 🛡️ Security Notes

**For Production Deployment**:
1. Change default admin credentials
2. Use environment variables for secrets
3. Implement HTTPS
4. Add rate limiting for login attempts
5. Use a real database instead of JSON files
6. Add CSRF protection
7. Set secure, httpOnly cookies with SameSite

## 📄 License

© 2026 Mac Applic International School. All rights reserved.

---

**Built with ❤️ for Mac Applic International School**
