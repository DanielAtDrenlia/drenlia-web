# Drenlia Web Application

This repository contains a full-stack web application with a React frontend, Node.js backend, and setup service. The application is containerized using Docker and uses Nginx as a reverse proxy.

## Prerequisites

- Docker and Docker Compose
- Git

## Project Structure

```
.
├── public/           # Static files served by Nginx
├── src/             # React frontend source code
├── server/          # Backend server
├── setup/           # Setup service for initial configuration
├── nginx.conf       # Nginx configuration
├── docker-compose.yml
└── Dockerfile
```

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd drenlia-web
```

2. If you plan to use a custom domain, configure it now:
   - Configure your domain's DNS to point to your server's IP address
   - Set up a reverse proxy on your host system (e.g., Apache or Nginx) to forward requests to the Docker container:
     ```nginx
     # Example Nginx configuration
     server {
         listen 80;
         server_name your-domain.com;

         location / {
             proxy_pass http://localhost:3010;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
         }
     }
     ```
   - Update the `setup/vite.config.ts` file to allow your domain:
     ```typescript
     export default defineConfig({
       server: {
         allowedHosts: [
           'localhost',
           '127.0.0.1',
           'your-domain.com'
         ]
       }
     })
     ```
   - After making changes to configuration files, restart the container:
     ```bash
     docker restart drenlia-web-app-1
     ```

3. Start the application:
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3010 (or your custom domain)
- Backend API: http://localhost:3010/api (or your custom domain/api)
- Setup Service: http://localhost:3010/setup (or your custom domain/setup)

## Initial Setup

Once the application is running and accessible in your browser, follow these steps to complete the initial setup:

1. Navigate to the setup page:
   ```
   http://yourdomain.com/setup
   ```

2. Complete the following setup sections:

   ### Frontend Environment
   - This section can be skipped as it contains default values that work well for most installations.

   ### Backend Environment
   
   #### Server Configuration
   - Set the Frontend URL (e.g., `http://localhost:3010` for local development)
   - Add your domain to Allowed Origins:
     ```
     http://localhost:3010,http://yourdomain.com,https://yourdomain.com
     ```
   - Configure the Session Secret (a secure random string for session management)

   #### Email Configuration
   - Configure your SMTP settings:
     - SMTP Host
     - SMTP Port
     - SMTP Username
     - SMTP Password
     - From Email Address
   - Test the email configuration to ensure emails can be sent

   #### Google OAuth Configuration (Optional)
   - Enable Google login by setting:
     - Google Client ID
     - Google Client Secret
   - Instructions for obtaining these credentials:
     1. Go to the Google Cloud Console
     2. Create a new project or select an existing one
     3. Enable the Google+ API
     4. Create OAuth 2.0 credentials
     5. Add your domain to the authorized domains

   #### Google Cloud Translation API (Optional)
   - Add your Google Cloud Translation API key to enable automatic translations
   - If not configured, you'll need to manually input content in both languages

3. Create Admin User
   - Set up your administrator account:
     - First Name
     - Last Name
     - Email Address
     - Password (use a strong password)
   - This account will have full access to the admin interface

4. Site Settings
   - Configure basic site information:
     - Company Name
     - Contact Email (displayed in the website footer)
     - Other optional settings as needed

5. Complete Setup
   - Review all settings
   - Click "Save All Settings"

### Accessing the Admin Interface

After completing the setup, you can access the admin interface at:
```
http://yourdomain.com/admin
```

Use the admin credentials you created during setup to log in.

*IMPORTANT*: YOU NEED TO disable the setup page.  Click the button in the Dashboard to do so.

Once logged in, you'll have access to the following features:

#### Dashboard
The dashboard provides an overview of your content and quick access to all administrative functions. You'll see:
- Total number of About Sections
- Total Team Members
- Number of Users
- Quick access links to all major sections
- Quick Tips for managing your website

#### Content Management
- **About Sections**: Edit your About page content, including your story, mission, and values. You can add, edit, and reorder sections to create a compelling narrative about your organization.

- **Team Members**: Manage your team profiles by adding or editing:
  - Names and titles
  - Professional bios
  - Profile photos
  - Contact information
  - Display order on the team page

- **Users**: Control user access to the admin interface:
  - Create new user accounts
  - Modify existing user permissions
  - Manage admin access levels
  - Maintain security through user management

#### Settings
Configure site-wide settings including:
- Visual assets (logos, images)
- General website settings
- Content translations
- Website appearance and functionality

#### Security Notice
A security warning will be displayed on the Dashboard if the Setup Service is still running. For security reasons, make sure to disable the setup service when not in use by clicking the "Disable Setup Service" button in the top-right corner of the Dashboard.

## Services

### Frontend (Port 3010)
- React application
- Served by Nginx
- Handles user interface and client-side logic

### Backend (Port 3011)
- Node.js server
- Handles API requests
- Manages database operations

### Setup Service (Port 3012)
- Initial configuration interface
- Disabled after first-time setup
- Can be re-enabled by removing the `.setup-disabled` file

### Setup API (Port 3013)
- Backend API for the setup service
- Handles configuration storage and validation

## Development

### Local Development

1. Install dependencies:
```bash
npm install
cd server && npm install
cd ../setup && npm install
cd api && npm install
```

2. Start development servers:
```bash
npm run dev
```

This will start:
- Frontend on port 3010
- Backend on port 3011
- Setup service on port 3012
- Setup API on port 3013

### Building for Production

```bash
npm run build
```

The build output will be in the `build/` directory.

## Database

The application uses SQLite as its database. The database file is located at `server/database.sqlite` and is persisted through Docker volumes.

## Troubleshooting

1. If the setup service is not accessible:
   - Check if the `.setup-disabled` file exists
   - Remove it to re-enable the setup service
   - Restart the containers

2. If you encounter port conflicts:
   - Modify the port mappings in `docker-compose.yml`
   - Update the corresponding configurations in `nginx.conf`

3. For database issues:
   - Check the database file permissions
   - Ensure the Docker volume is properly mounted

4. If configuration changes don't take effect:
   - After modifying configuration files (like `vite.config.ts`, `package.json`, etc.), you need to restart the container:
     ```bash
     docker restart drenlia-web-app-1
     ```
   - If the changes still don't take effect, try rebuilding the container:
     ```bash
     docker-compose down
     docker-compose up -d --build
     ```
   - Make sure you're editing the correct configuration file (e.g., `setup/vite.config.ts` for the setup service)
   - Verify that the domain name is exactly as it appears in the error message
   - Check that there are no typos in the domain name
   - Ensure the configuration file is saved properly

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0) - see the [LICENSE](LICENSE) file for details.

This means you are free to:
- Use the software for any purpose
- Study how the software works
- Modify the software
- Distribute the software
- Share your modifications

Under the condition that you must:
- Include the original copyright notice
- Include the license text
- State significant changes made to the software
- Include the source code or provide a way to obtain it
- Use the same license for derivative works
