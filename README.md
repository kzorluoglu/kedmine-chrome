# Redmine Time Tracker - Chrome Extension

A Chrome Extension with Vue.js to efficiently track time for Redmine tickets.

## Features

- Create Timer via shortcut (`Ctrl + Shift + k`) 
  - Usage: Go to Issue Page on redmine and type this shortcut.
- Multiple Timer for some issue
- Real-time search for tickets.
- CSV to Redmine Table Converter
- Timer functionality integrated for each ticket.
- Direct API integration with Redmine.
- Comment functionality for each ticket.
- Clean and responsive UI/UX.


## Screenshots
_Issues Page_

![Issues Page](/screenshots/issues-page.png)

_Setup Page_

![Setup Page](/screenshots/setup-page.png)

_Search Result_

![Search Result](/screenshots/search-results.png)

_CSV to Redmine Table Converter_

![CSV to Redmine Table Converter](/screenshots/csvToTable1.png)

![CSV to Redmine Table Converter](/screenshots/csvToTable2.png)


## Steps to Use the Extension

1. **Clone the project or Download `extension` folder**
2. **Activate Developer Mode in Chrome**
    * Open the Chrome browser.
    * Go to `chrome://extensions/` or navigate to Menu > More Tools > Extensions.
    * Ensure the Developer mode toggle in the top right corner is turned on.
3. Load the Extension
    * Click the Load unpacked button on the Extensions page.
    * Navigate to your project's directory and select the `extension` folder.
    * Click the Select Folder button (or equivalent, depending on your OS).


## Steps to Build the Extension

1. **Build the project**

   Navigate to your project's root directory in the terminal and run the following command:

   ```bash
   npm run build
   ```
   This will generate the dist folder, which contains the built files required for the extension.

2. **Activate Developer Mode in Chrome**
   * Open the Chrome browser.
   * Go to `chrome://extensions/` or navigate to Menu > More Tools > Extensions.
   * Ensure the Developer mode toggle in the top right corner is turned on.

3. Load the Extension
   * Click the Load unpacked button on the Extensions page.
   * Navigate to your project's directory and select the dist folder.
   * Click the Select Folder button (or equivalent, depending on your OS).

4. Extension is now active!
   * You should now see your extension listed on the Extensions page in Chrome. If the extension has a popup or icon, you should also see it next to the address bar.
   * Use the extension as needed.


## ToDo
   * Temp Timer Component
        * This component must be accepts an Issue ID and an optional title. This is reasonable if you want to track time against specific issues.
   *  Issue Text or Issue ID Information - Need Idea
        * Solution ideas
            * URL Bar as Issue Comment Text: This would be convenient, but you need to ensure the URL contains relevant information about the issue???
            * Right-Click Menu for Issue Comment Input???
   

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yourrepositoryname.git
cd yourrepositoryname
````

2. Install dependencies:
```bash
npm install

````


3. Run the project locally:
```bash
npm run build

````


## Configuration
The application requires certain settings to communicate with the Redmine API, such as the Redmine URL,
API Token, and optional HTTP basic authentication credentials. This can be set up on the Setup page of the application.





## Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.



## License
MIT












