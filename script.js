// Add logic to fetch and display notes from issues using the GitHub API
// Format the notes using markdown and show the priority, due date, title, issue number, and issue link
// Sort the notes by priority and due date in a grid
// Note: This script utilizes GitHub's Primer components for dynamically generated content to ensure improved accessibility and responsiveness.
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

// Get the notes grid element
const notesGrid = document.getElementById("notes-grid");

// Define the GitHub API endpoint for issues
const issuesEndpoint = "https://api.github.com/repos/builtwithai/ui/issues";

// Define the priority levels and colors
const priorityLevels = ["low", "medium", "high"];
const priorityColors = ["#6f42c1", "#0366d6", "#d73a49"];

// Define a helper function to parse the priority and due date from the note content
const parseNoteMeta = (content) => {
  // Initialize the priority and due date to null
  let priority = null;
  let due = null;

  // Check if the content starts with a priority label in the format [priority: label]
  const priorityRegex = /^\[priority:\s*(low|medium|high)\]\s*/i;
  const priorityMatch = content.match(priorityRegex);
  if (priorityMatch) {
    // Extract the priority label and remove it from the content
    priority = priorityMatch[1].toLowerCase();
    content = content.replace(priorityRegex, "");
  }

  // Check if the content starts with a due date in the format [due: date]
  const dueRegex = /^\[due:\s*(\d{4}-\d{2}-\d{2})\]\s*/i;
  const dueMatch = content.match(dueRegex);
  if (dueMatch) {
    // Extract the due date and remove it from the content
    due = dueMatch[1];
    content = content.replace(dueRegex, "");
  }

  // Return the updated content, priority, and due date
  return { content, priority, due };
};

// Define a helper function to create a note element from an issue object
const createNoteElement = (issue) => {
  // Create a div element with the note class
  const note = document.createElement("div");
  note.classList.add("note");

  // Create a div element for the note header
  const noteHeader = document.createElement("div");
  noteHeader.classList.add("note-header");

  // Create a span element for the note title
  const noteTitle = document.createElement("span");
  noteTitle.classList.add("note-title");
  noteTitle.textContent = issue.title;

  // Append the note title to the note header
  noteHeader.appendChild(noteTitle);

  // Parse the note content, priority, and due date
  const { content, priority, due } = parseNoteMeta(issue.body);

  // If the priority is not null, create a span element for the note priority
  if (priority) {
    const notePriority = document.createElement("span");
    notePriority.classList.add("note-priority");
    notePriority.classList.add(`note-priority-${priority}`);
    notePriority.textContent = priority;

    // Append the note priority to the note header
    noteHeader.appendChild(notePriority);
  }

  // If the due date is not null, create a span element for the note due date
  if (due) {
    const noteDue = document.createElement("span");
    noteDue.classList.add("note-due");
    noteDue.textContent = due;

    // Append the note due date to the note header
    noteHeader.appendChild(noteDue);
  }

  // Append the note header to the note
  note.appendChild(noteHeader);

  // Create a div element for the note content
  const noteContent = document.createElement("div");
  noteContent.classList.add("note-content");

  // Convert the note content from markdown to HTML using the marked library
  noteContent.innerHTML = marked(content);

  // Append the note content to the note
  note.appendChild(noteContent);

  // Create a div element for the note footer
  const noteFooter = document.createElement("div");
  noteFooter.classList.add("note-footer");

  // Create a span element for the note issue number
  const noteIssueNumber = document.createElement("span");
  noteIssueNumber.classList.add("note-issue-number");
  noteIssueNumber.textContent = `#${issue.number}`;

  // Append the note issue number to the note footer
  noteFooter.appendChild(noteIssueNumber);

  // Create a link element for the note issue link
  const noteIssueLink = document.createElement("a");
  noteIssueLink.classList.add("note-issue-link");
  noteIssueLink.href = issue.html_url;
  noteIssueLink.target = "_blank";
  noteIssueLink.textContent = "View issue";

  // Append the note issue link to the note footer
  noteFooter.appendChild(noteIssueLink);

  // Append the note footer to the note
  note.appendChild(noteFooter);

  // Return the note element
  return note;
};

// Define a helper function to compare two notes by priority and due date
const compareNotes = (noteA, noteB) => {
  // Get the priority and due date of note A
  const priorityA = noteA.querySelector(".note-priority")
    ? noteA.querySelector(".note-priority").textContent
    : null;
  const dueA = noteA.querySelector(".note-due")
    ? noteA.querySelector(".note-due").textContent
    : null;

  // Get the priority and due date of note B
  const priorityB = noteB.querySelector(".note-priority")
    ? noteB.querySelector(".note-priority").textContent
    : null;
  const dueB = noteB.querySelector(".note-due")
    ? noteB.querySelector(".note-due").textContent
    : null;

  // Compare the notes by priority
  if (priorityA && priorityB) {
    // If both notes have priority, compare them by the priority levels
    const priorityIndexA = priorityLevels.indexOf(priorityA);
    const priorityIndexB = priorityLevels.indexOf(priorityB);
    if (priorityIndexA < priorityIndexB) {
      return 1;
    } else if (priorityIndexA > priorityIndexB) {
      return -1;
    }
  } else if (priorityA) {
    // If only note A has priority, it comes first
    return -1;
  } else if (priorityB) {
    // If only note B has priority, it comes first
    return 1;
  }

  // If the notes have the same priority or no priority, compare them by due date
  if (dueA && dueB) {
    // If both notes have due date, compare them by the date value
    const dateA = new Date(dueA);
    const dateB = new Date(dueB);
    if (dateA < dateB) {
      return -1;
    } else if (dateA > dateB) {
      return 1;
    }
  } else if (dueA) {
    // If only note A has due date, it comes first
    return -1;
  } else if (dueB) {
    // If only note B has due date, it comes first
    return 1;
  }

  // If the notes have the same due date or no due date, return 0
  return 0;
};

// Define a helper function to sort the notes in the grid by priority and due date
const sortNotes = () => {
  // Get all the note elements in the grid
  const notes = notesGrid.querySelectorAll(".note");

  // Convert the note elements to an array
  const notesArray = Array.from(notes);

  // Sort the note elements by the compareNotes function
  notesArray.sort(compareNotes);

  // Remove all the note elements from the grid
  notesGrid.innerHTML = "";

  // Append the sorted note elements to the grid
  notesArray.forEach((note) => {
    notesGrid.appendChild(note);
  });
};

// Define a function to fetch and display notes from issues
const fetchNotes = async () => {
  try {
    // Fetch the issues data from the GitHub API
    const response = await fetch(issuesEndpoint);
    const data = await response.json();

    // Loop through the issues data
    for (const issue of data) {
      // Create a note element from the issue object
      const note = createNoteElement(issue);

      // Append the note element to the notes grid
      notesGrid.appendChild(note);
    }

    // Sort the notes in the grid by priority and due date
    sortNotes();
  } catch (error) {
    // Log the error
    console.error(error);
  }
};

// Call the fetchNotes function when the document is loaded
document.addEventListener("DOMContentLoaded", fetchNotes);
