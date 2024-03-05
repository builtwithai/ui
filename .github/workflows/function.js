// This is the serverless function code to parse the issue data and update the ui
const fs = require('fs')
const path = require('path')
const marked = require('marked')
const { execSync } = require('child_process')

// Get the issue data from the input
const issue = JSON.parse(process.env.INPUT_ISSUE)

// Extract the note title, content, priority, and due date from the issue title and body
const noteTitle = issue.title
const noteContent = issue.body
const notePriority = issue.body.match(/\[priority: (low|medium|high)\]/i)?.[1] || 'low'
const noteDueDate = issue.body.match(/\[due: (\d{4}-\d{2}-\d{2})\]/)?.[1] || '9999-99-99'
const noteIssueNumber = issue.number
const noteIssueLink = issue.html_url

// Format the note content using markdown
const noteHtml = marked(noteContent)

// Create the note element using primer components
const noteElement = `
<div class="Box Box--condensed d-flex flex-column flex-items-start p-3 mb-3" data-priority="${notePriority}" data-due="${noteDueDate}">
  <div class="d-flex flex-items-center flex-justify-between width-full">
    <h4 class="Box-title">${noteTitle}</h4>
    <span class="Label Label--${notePriority}">${notePriority}</span>
  </div>
  <div class="markdown-body mt-2">
    ${noteHtml}
  </div>
  <div class="d-flex flex-items-center flex-justify-end width-full mt-2">
    <span class="text-gray-light">#${noteIssueNumber}</span>
    <a href="${noteIssueLink}" class="ml-2 btn btn-sm btn-outline">View issue</a>
  </div>
</div>
`

// Update the ui by appending or replacing the note element in the index.html file
const indexFile = path.join(__dirname, '..', '..', 'index.html')
const indexHtml = fs.readFileSync(indexFile, 'utf8')
const notesContainer = indexHtml.match(/<div id="notes-container">([\s\S]*?)<\/div>/)?.[1] || ''
const noteSelector = `div[data-issue-number="${noteIssueNumber}"]`
const noteExists = notesContainer.includes(noteSelector)
const updatedNotesContainer = noteExists
  ? notesContainer.replace(new RegExp(`${noteSelector}([\\s\\S]*?)<\\/div>`), noteElement)
  : notesContainer + noteElement
const updatedIndexHtml = indexHtml.replace(/<div id="notes-container">([\s\S]*?)<\/div>/, `<div id="notes-container">${updatedNotesContainer}</div>`)

// Write the updated index.html file
fs.writeFileSync(indexFile, updatedIndexHtml)

// Commit and push the changes to the gh-pages branch
execSync('git config --global user.name "GitHub Actions"')
execSync('git config --global user.email "actions@github.com"')
execSync('git add index.html')
execSync(`git commit -m "Update note from issue #${noteIssueNumber}"`)
execSync('git push origin gh-pages')
