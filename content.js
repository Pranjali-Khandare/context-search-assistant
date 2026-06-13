console.log("CSA Extension loaded v2");

const OPENROUTER_API_KEY = "YOUR_OPENROUTER_KEY_HERE";

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === " ") {
    event.preventDefault();
    openSearchBox();
  }
});

function openSearchBox(prefillText = "") {
  const existingBox = document.getElementById("context-search-box");
  if (existingBox) existingBox.remove();

  const box = document.createElement("div");
  box.id = "context-search-box";

  box.innerHTML = `
    <div id="drag-handle" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:8px; margin-bottom:8px; cursor:grab;">
      <b style="font-size:14px;">Context Search</b>
      <button id="close-btn" style="border:none; background:transparent; font-size:16px; cursor:pointer; color:#888;">x</button>
    </div>
    <input type="text" id="search-input" placeholder="Ask anything..." />
    <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
      <button id="search-btn">Ask</button>
      <button id="save-btn">Save note</button>
    </div>
    <div id="result" style="margin-top:10px; font-size:13px; line-height:1.6; max-height:220px; overflow-y:auto;"></div>
    <button id="toggle-notes-btn" style="margin-top:10px;">Show Notes</button>
    <div id="notes" style="display:none; margin-top:10px; font-size:12px;">
      <b>Saved Notes:</b>
      <ul id="notes-list" style="padding-left:16px; margin-top:6px;"></ul>
    </div>
  `;

  Object.assign(box.style, {
    position: "fixed",
    left: "60%",
    top: "120px",
    width: "340px",
    background: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "14px",
    zIndex: "9999",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box"
  });

  document.body.appendChild(box);

  const input = box.querySelector("#search-input");
  Object.assign(input.style, {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    fontSize: "13px"
  });

  const searchBtn = box.querySelector("#search-btn");
  const saveBtn = box.querySelector("#save-btn");
  const toggleBtn = box.querySelector("#toggle-notes-btn");

  Object.assign(searchBtn.style, {
    padding: "7px 14px",
    borderRadius: "6px",
    border: "none",
    background: "#4285F4",
    color: "white",
    cursor: "pointer",
    fontSize: "13px"
  });

  Object.assign(saveBtn.style, {
    padding: "7px 14px",
    borderRadius: "6px",
    border: "none",
    background: "#34A853",
    color: "white",
    cursor: "pointer",
    fontSize: "13px"
  });

  Object.assign(toggleBtn.style, {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "transparent",
    cursor: "pointer",
    fontSize: "12px"
  });

  const resultDiv = box.querySelector("#result");
  const notesDiv = box.querySelector("#notes");
  const notesList = box.querySelector("#notes-list");
  const closeBtn = box.querySelector("#close-btn");

  if (prefillText) input.value = prefillText;

  let notes = JSON.parse(localStorage.getItem("csa-notes")) || [];
  notes.forEach(note => {
    const li = document.createElement("li");
    li.innerText = note;
    notesList.appendChild(li);
  });

  closeBtn.addEventListener("click", () => box.remove());

  searchBtn.addEventListener("click", async () => {
    const query = input.value.trim();
    if (query.length > 0) {
      resultDiv.innerHTML = "<i style='color:#888;'>Thinking...</i>";
      const answer = await askAI(query);
      resultDiv.innerHTML = `<span>${answer}</span>`;
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn.click();
  });

  saveBtn.addEventListener("click", () => {
    const noteText = resultDiv.innerText.trim();
    if (noteText.length > 0 && noteText !== "Thinking...") {
      notes.push(noteText);
      localStorage.setItem("csa-notes", JSON.stringify(notes));
      const li = document.createElement("li");
      li.innerText = noteText;
      notesList.appendChild(li);
      saveBtn.innerText = "Saved!";
      setTimeout(() => saveBtn.innerText = "Save note", 1500);
    }
  });

  toggleBtn.addEventListener("click", () => {
    if (notesDiv.style.display === "none") {
      notesDiv.style.display = "block";
      toggleBtn.innerText = "Hide Notes";
    } else {
      notesDiv.style.display = "none";
      toggleBtn.innerText = "Show Notes";
    }
  });

  const handle = box.querySelector("#drag-handle");
  let isDragging = false;
  let offsetX, offsetY;

  handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
    handle.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      box.style.left = e.clientX - offsetX + "px";
      box.style.top = e.clientY - offsetY + "px";
      box.style.transform = "none";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    handle.style.cursor = "grab";
  });

  input.focus();
}

async function askAI(query) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/Pranjali-Khandare/context-search-assistant",
        "X-Title": "Context Search Assistant"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{
          role: "user",
          content: `Answer this question clearly and concisely in 3-4 sentences: ${query}`
        }]
      })
    });
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    } else {
      console.log("OpenRouter response:", JSON.stringify(data));
      return "Could not get an answer. Please try again.";
    }
  } catch (error) {
    console.log("OpenRouter error:", error);
    return "Search failed. Check your connection.";
  }
}