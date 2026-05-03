<div align="center">

# 🚀 Bhoompally Kalyan Reddy — Portfolio

### AI Engineer • Full-Stack Developer • Published Researcher

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-00f2fe?style=for-the-badge&logoColor=white)](https://kalyan-1845.github.io/kalyan-s-portfolio/)
[![GitHub Stars](https://img.shields.io/github/stars/kalyan-1845/kalyan-s-portfolio?style=for-the-badge&color=f5576c&logo=github)](https://github.com/kalyan-1845/kalyan-s-portfolio/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-43e97b.svg?style=for-the-badge)](./LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/kalyan-1845/kalyan-s-portfolio?style=for-the-badge&color=4facfe)](https://github.com/kalyan-1845/kalyan-s-portfolio/commits/main)

<br/>

> A **high-performance**, **single-page** developer portfolio built with pure HTML, CSS & JavaScript — featuring glassmorphism design, liquid skill bars, dynamic animations, and a custom cursor experience.

<br/>

</div>

---

## 📸 Preview

<div align="center">

| Dark Theme | Light Theme |
|:---:|:---:|
| Futuristic neon-glow aesthetic | Clean, professional daytime mode |

</div>

---

## ✨ Features

### 🎨 Design & UX
- **Glassmorphism UI** — Frosted-glass cards with `backdrop-filter` blur effects
- **Dual Theme** — Seamless dark/light mode toggle with CSS custom properties
- **Custom Cursor** — Animated dot + follower cursor with interactive hover states
- **Liquid Skill Bars** — SVG wave-animated progress bars with gradient colors
- **Smooth Scroll** — Section-aware navigation with active link highlighting
- **Parallax Hero** — Depth-layered hero section with scroll-driven motion
- **Micro-Animations** — Floating icons, pulsing CTAs, fade-in-up reveals, glowing text

### 📄 Sections
| Section | Description |
|---------|-------------|
| **Hero** | Animated typing effect, social links, dual CTA buttons |
| **About** | Profile image with hover zoom, personal narrative |
| **Education** | Gradient-bordered timeline cards with detail grid |
| **Experience** | Role cards with tech skill tags and date badges |
| **AI Roadmap** | Visual career progression in artificial intelligence |
| **Achievements** | Hackathon wins, publications, and milestones |
| **Projects** | Image-card grid with live demo + GitHub links |
| **Certificates** | Filterable certificate gallery with modal previews |
| **Contact** | EmailJS-powered contact form with validation |

### 🛠️ Technical Highlights
- **Zero Dependencies** — Pure HTML/CSS/JS, no build step required
- **Responsive** — Fully mobile-optimized with breakpoints at 768px and 480px
- **Resume Modal** — In-page PDF viewer popup (no download/redirect) with mobile fallback
- **SEO-Ready** — Semantic HTML5 elements, proper heading hierarchy
- **Performance** — Single-file architecture, minimal external requests
- **EmailJS Integration** — Server-less contact form delivery

---

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- [Git](https://git-scm.com/) (for cloning)

### Installation

```bash
# Clone the repository
git clone https://github.com/kalyan-1845/kalyan-s-portfolio.git

# Navigate to the project
cd kalyan-s-portfolio

# Open in browser (pick one)
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

### Local Development Server (Optional)

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using VS Code
# Install "Live Server" extension → Right-click index.html → Open with Live Server
```

Then visit `http://localhost:8000` in your browser.

---

## 📁 Project Structure

```
kalyan-s-portfolio/
├── index.html                          # Main portfolio (HTML + CSS + JS)
├── Kalyan_Software_Engineer_Resume.pdf  # Resume PDF (displayed in modal)
├── profile.jpg                         # Profile photo
├── project-*.png                       # Project preview screenshots
├── Certificate-*.png/pdf               # Certificate assets
├── cert_*.png                          # Certificate thumbnails
├── certificates_banner.png             # Certificates section banner
├── generate-placeholders.js            # Placeholder image generator utility
├── LICENSE                             # MIT License
├── SECURITY.md                         # Security Policy
└── README.md                           # This file
```

---

## ⚙️ Configuration

### EmailJS Setup
To enable the contact form, replace the placeholder values in `index.html`:

```javascript
// Line ~22: Replace with your EmailJS public key
emailjs.init("YOUR_PUBLIC_KEY");

// In the form submission handler, update:
emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", { ... });
```

1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service and template
3. Copy your **Public Key**, **Service ID**, and **Template ID**

### Theme Customization
All design tokens are defined as CSS custom properties in `:root`:

```css
:root {
    --primary-color: #00f2fe;    /* Cyan accent */
    --secondary-color: #4facfe;  /* Blue accent */
    --accent-color: #ff00cc;     /* Pink accent */
    --bg-color: #0f0c29;        /* Dark background */
    --card-bg: rgba(255, 255, 255, 0.05);
    --text-color: #ffffff;
    --text-secondary: #b8bec8;
}
```

---

## 🌐 Deployment

### GitHub Pages (Recommended)

1. Push your code to `main` branch
2. Go to **Settings** → **Pages**
3. Set Source to **Deploy from a branch** → `main` → `/ (root)`
4. Your site will be live at `https://<username>.github.io/kalyan-s-portfolio/`

### Other Platforms

| Platform | Command / Steps |
|----------|-----------------|
| **Vercel** | `npx vercel --prod` |
| **Netlify** | Drag & drop the project folder |
| **Cloudflare Pages** | Connect GitHub repo → set build output to `/` |

---

## 🔒 Security

Please see [SECURITY.md](./SECURITY.md) for our security policy and responsible disclosure guidelines.

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

You are free to use this as a template for your own portfolio. Attribution is appreciated but not required.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📬 Contact

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-kalyan--1845-181717?style=for-the-badge&logo=github)](https://github.com/kalyan-1845)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Bhoompally_Kalyan_Reddy-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/bhoompally-kalyan-reddy/)
[![Instagram](https://img.shields.io/badge/Instagram-swag__suprem__4-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/swag_suprem_4)

</div>

---

<div align="center">

**⭐ If you find this portfolio inspiring, consider giving it a star!**

Made with ❤️ by **Bhoompally Kalyan Reddy**

</div>
