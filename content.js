console.log("Extension loaded");

//  Keyboard shortcut: Ctrl + Shift + Space
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === " ") {
    event.preventDefault();
    openSearchBox();
  }
});

//  Main function to create box
function openSearchBox(event = { pageX: window.innerWidth / 2, pageY: 150 }) {

  const existingBox = document.getElementById("context-search-box");
  if (existingBox) existingBox.remove();

  const box = document.createElement("div");
  box.id = "context-search-box";

  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:4px; margin-bottom:6px;">
      <b>Quick Search</b>
      <button id="close-btn">X</button>
    </div>

<input type="text" id="search-input" placeholder="Ask something..."
style="width:100%; padding:6px; margin-top:6px;" />    
    <div style="margin-top:8px; display:flex; gap:6px;">
  <button id="search-btn">Search</button>
  <button id="save-btn">Save</button>
</div>
    <div id="result" style="margin-top:8px;"></div>
<button id="toggle-notes-btn">Show Notes</button>

<div id="notes" style="display:none; margin-top:10px; font-size:12px;">
  <b>Notes:</b>
  <ul id="notes-list"></ul>
</div>

     `;

  // Floating panel style
  box.style.position = "fixed";
  box.style.left = "60%";
  box.style.top = "120px";
  box.style.width = "300px";
  box.style.overflow = "hidden";
  box.style.background = "white";
  box.style.border = "1px solid #ccc";
  box.style.padding = "10px";
  box.style.zIndex = "9999";
  box.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  box.style.borderRadius = "8px";
  box.style.background = "#ffffff";
  box.style.color = "#000000";
  box.style.borderRadius = "10px";
  box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  box.style.fontFamily = "Arial, sans-serif";

  document.body.appendChild(box);
  box.style.fontFamily = "Arial, sans-serif";
box.style.boxSizing = "border-box";

  const input = box.querySelector("#search-input");
input.style.width = "100%";
input.style.boxSizing = "border-box";
  const button = box.querySelector("#search-btn");
  const saveBtn = box.querySelector("#save-btn");
  const toggleBtn = box.querySelector("#toggle-notes-btn");
  const notesDiv = box.querySelector("#notes");
  const resultDiv = box.querySelector("#result");
  const notesList = box.querySelector("#notes-list");
  const closeBtn = box.querySelector("#close-btn");
  button.style.padding = "6px 10px";
button.style.borderRadius = "6px";
button.style.border = "none";
button.style.background = "#4CAF50";
button.style.color = "white";
button.style.cursor = "pointer";
saveBtn.style.cursor = "pointer";

saveBtn.style.padding = "6px 10px";
saveBtn.style.borderRadius = "6px";
saveBtn.style.border = "none";
saveBtn.style.background = "#2196F3";
saveBtn.style.color = "white";

closeBtn.style.border = "none";
closeBtn.style.background = "transparent";
closeBtn.style.cursor = "pointer";

  let notes = JSON.parse(localStorage.getItem("notes")) || [];

  // Load saved notes
  notes.forEach(note => {
    const li = document.createElement("li");
    li.innerText = note;
    notesList.appendChild(li);
  });

  // Close button
  closeBtn.addEventListener("click", () => {
    box.remove();
  });

  // Search
  button.addEventListener("click", () => {
    const query = input.value;

    if (query.length > 0) {
      resultDiv.innerText = "Thinking...";

      setTimeout(() => {
        resultDiv.innerText =
          "Answer for: " + query + "\n\nThis is a contextual explanation.";
      }, 1000);
    }
  });

  // Save notes
  saveBtn.addEventListener("click", () => {
    const noteText = resultDiv.innerText;

    if (noteText.length > 0) {
      notes.push(noteText);
      localStorage.setItem("notes", JSON.stringify(notes));

      const li = document.createElement("li");
      li.innerText = noteText;
      notesList.appendChild(li);
    }
  });

  //  DRAG FUNCTION (already placed correctly)
  let isDragging = false;
  let offsetX, offsetY;

  box.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      box.style.left = e.clientX - offsetX + "px";
      box.style.top = e.clientY - offsetY + "px";
      box.style.transform = "none"; // important for movement
      toggleBtn.addEventListener("click", () => {
  if (notesDiv.style.display === "none") {
    notesDiv.style.display = "block";
    toggleBtn.innerText = "Hide Notes";
  } else {
    notesDiv.style.display = "none";
    toggleBtn.innerText = "Show Notes";
  }
});
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

}
//  Keep selection feature ALSO
document.addEventListener("mouseup", (event) => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    openSearchBox(event);
  }
});