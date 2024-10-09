# Recent Connections App

A tool that enables investors to view the latest connections made by their own first-degree connections on LinkedIn through Sales Navigator—providing valuable insights into network growth and potential opportunities. The app efficiently identifies new connections by comparing profile IDs, allowing proactive engagement with emerging startups and founders within your network.

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
  - [Providing Your LinkedIn Session Cookie](#providing-your-linkedin-session-cookie)
  - [Monitoring Connections](#monitoring-connections)
  - [Viewing New Connections](#viewing-new-connections)
- [Caveats and Limitations](#caveats-and-limitations)
- [Configuration](#configuration)

---

## Features

- **Recent Connections Tracking**: Monitor new connections made by your own first-degree connections on LinkedIn.
- **Efficient Data Extraction**: Utilizes profile ID differencing to accurately detect new connections while minimizing data retrieval time.
- **Selective Data Scraping**: Only scrapes full profile data for new connections, optimizing resource usage.
- **Filtering Capabilities**: Apply filters such as geographic location or industry to focus on relevant connections.
- **User-Friendly Interface**: Simple and intuitive design for ease of use.

---

## How It Works

The Recent Connections App is designed to efficiently identify new connections made by your first-degree connections on LinkedIn Sales Navigator. Here's an overview of the data extraction process:

1. **Initial Data Capture**:

   - **Profile ID Scraping**: On the first run, the app scrapes the unique profile IDs of your connection's connections from their LinkedIn Sales Navigator page. Profile IDs are consistent identifiers that remain the same even if a user changes their name.
   - **Database Storage**: The extracted profile IDs are stored in a database, establishing a baseline of existing connections for each of your monitored connections.

2. **Monitoring for New Connections**:

   - **Rescraping Profile IDs**: When you want to check for recent connections, the app rescrapes the profile IDs from your connection's connections page.
   - **Differencing (Diffing)**: The app compares the newly scraped profile IDs against those stored in the database.
   - **Identifying New Connections**: Any profile IDs not present in the original dataset are flagged as new connections.

3. **Selective Profile Scraping**:

   - **Targeted Data Extraction**: For each new connection identified, the app navigates to the profile and scrapes all available data, such as professional background, current role, and company information.
   - **Data Enrichment**: This information enriches your database, providing deeper insights into the new connections' potential relevance.

4. **Efficiency and Performance**:

   - **Optimized Scraping**: By using profile IDs for comparison, the app reduces the chance of false positives due to name changes or duplicates.
   - **Resource Management**: Full profile data is only scraped for new connections, ensuring efficient use of resources and reducing overall scraping time.

---

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/recent-connections-app.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd recent-connections-app
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   ```

4. **Configure the Application**:

   - Rename the `.env.example` file to `.env`.
   - Insert your LinkedIn session cookie and any other required configurations into the `.env` file.

5. **Run the Application**:

   ```bash
   npm start
   ```

---

## Usage

### Providing Your LinkedIn Session Cookie

To enable the app to access your LinkedIn data, you must provide your LinkedIn session cookie (`li_at`). This allows the app to authenticate requests as if they were coming from your browser session.

#### Steps to Obtain Your LinkedIn Session Cookie (`li_at`):

1. **Log In to LinkedIn**:

   - Open your web browser and log in to your LinkedIn account.

2. **Access Developer Tools**:

   - Right-click anywhere on the page and select **Inspect** or press `F12` to open the developer tools.

3. **Navigate to the Application Tab**:

   - In the developer tools pane, click on the **Application** tab (in Chrome) or **Storage** tab (in Firefox).

4. **Locate Cookies**:

   - In the sidebar, under **Storage** (Firefox) or **Cookies** (Chrome), click on **Cookies** and then select `https://www.linkedin.com`.

5. **Find the `li_at` Cookie**:

   - In the list of cookies, look for the one named `li_at`.
   - The `li_at` cookie is used to authenticate members and API clients and typically has a duration of 1 year.

6. **Copy the Cookie Value**:

   - Click on the `li_at` cookie to highlight it.
   - Copy the value from the **Value** field.

7. **Update the `.env` File**:

   - In your `.env` file, set the `LINKEDIN_SESSION_COOKIE` variable:

     ```env
     LINKEDIN_SESSION_COOKIE='your_li_at_cookie_value_here'
     ```

   - Ensure that the cookie value is enclosed in single or double quotes if it contains special characters.

**Security Note**:

- **Protect Your Session Cookie**: Your `li_at` session cookie grants access to your LinkedIn account. Do not share it with anyone or commit it to a public repository.
- **Regular Updates**: Session cookies may expire or become invalidated. If you encounter authentication issues, repeat the steps above to obtain a new session cookie.

### Monitoring Connections

1. **Add Connections to Monitor**:

   - Input the LinkedIn profile URLs of your first-degree connections whose new connections you want to monitor.
   - The app will perform an initial scrape to collect and store the profile IDs of their current connections.

2. **Set Up Regular Checks**:

   - Schedule automated checks to rescrape the connections at desired intervals using a scheduler or cron job.
   - Alternatively, initiate a manual check whenever needed by running the appropriate command.

### Viewing New Connections

1. **Identify New Connections**:

   - After rescraping, the app will compare the new list of profile IDs with the stored data.
   - New connections will be highlighted and listed separately in the application's interface or output.

2. **Review New Connection Details**:

   - Select a new connection to view their full profile data, which has been scraped and stored.
   - Analyze professional backgrounds, current positions, company information, and other relevant details.

3. **Engage Proactively**:

   - Use the insights gained to reach out to promising contacts within your extended network.
   - Leverage mutual connections for warm introductions and networking opportunities.

---

## Caveats and Limitations

- **Access Restrictions**:

  - The app can only monitor the recent connections of your own first-degree connections on LinkedIn.
  - LinkedIn Sales Navigator does not allow access to the connections of users who are not directly connected to you.

- **LinkedIn Sales Navigator Limitations**:

  - Sales Navigator limits the number of viewable connections to 2,500 per profile.
  - To access connections beyond this limit, apply filters such as geographic location, industry sector, or other relevant criteria.

- **Data Privacy and Compliance**:

  - Ensure compliance with LinkedIn's [User Agreement](https://www.linkedin.com/legal/user-agreement) and [Privacy Policy](https://www.linkedin.com/legal/privacy-policy).
  - Use the app responsibly and ethically, respecting user privacy and data ownership.
  - Be aware that scraping data from LinkedIn may violate their user agreement and could result in account restrictions.

- **Technical Considerations**:

  - **IP Blocking**: Excessive scraping activity may trigger LinkedIn's security measures.

    - **Mitigation**: Implement rate limiting and adhere to respectful scraping practices.

  - **CAPTCHA Challenges**: LinkedIn may present CAPTCHA challenges to verify user activity.

    - **Mitigation**: Monitor for CAPTCHA occurrences and handle them appropriately.

---

## Configuration

1. **LinkedIn Session Cookie**:

   - Update the `.env` file with your LinkedIn session cookie (`li_at`).

     ```env
     LINKEDIN_SESSION_COOKIE='your_li_at_cookie_value_here'
     ```

   - **Security Note**: Keep your `.env` file secure and avoid committing it to version control systems like Git.

2. **Database Settings**:

   - Configure your preferred database (e.g., MongoDB, PostgreSQL) in the `config.js` or `.env` file.
   - Ensure the database service is running and accessible by the application.

3. **Filtering Options**:

   - Adjust filters for connections in the application's settings or configuration files.
   - Example filters include:

     - **Location**: Focus on connections in specific geographic regions.
     - **Industry**: Narrow down to particular industries of interest.
     - **Seniority Level**: Target connections at certain career levels.

4. **Scheduling Settings**:

   - Set up cron jobs or use a scheduling library to automate scraping at regular intervals.
   - Configure the frequency based on your needs and to avoid excessive load on LinkedIn's servers.

---
