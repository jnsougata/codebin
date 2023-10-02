var editor = ace.edit("main");
var modelist = ace.require("ace/ext/modelist");
let editorStatusElem = document.querySelector("#editor-status")
let editorLinkElem = document.querySelector("#editor-link")
let editorModeElem = document.querySelector("#editor-mode")
let editorThemeElem = document.querySelector("#editor-theme")
let sidebar = document.querySelector(".sidebar")
let toast = document.querySelector(".toast")
let defaultId = null;
let globalBinId = "";
let globalContextFile = null;
const maxFileSize = 400 * 1024
const primaryBlue = "#1c4ce4"
const toastGreen = "#27ab5a"
const toastRed = "#c32c59"
const menu = document.querySelector("#menu")

let sidebarHidden = false
menu.addEventListener("click", () => {
    if (sidebarHidden) {
        sidebar.style.display = "flex"
        sidebarHidden = false
    } else {
        sidebar.style.display = "none"
        sidebarHidden = true
    }
})

editor.setOptions({
    fontSize: "15pt",
    copyWithEmptySelection: true,
    enableLiveAutocompletion: true,
    showPrintMargin: false,
});
editor.setTheme("ace/theme/one_dark");


window.addEventListener("DOMContentLoaded", () => {
    globalBinId = window.location.pathname.split("/")[2]
    editorThemeElem.innerHTML = `One Dark`;
    editorLinkElem.innerHTML = `${window.location.origin}/shared/${globalBinId}`;
    fetch(`/api/bin/${globalBinId}`)
        .then(response => response.json())
        .then(data => {
            if (!data) return console.error("No data returned from server")
            data.forEach(file => {
                let sidebarItem = newFile(file)
                sidebar.appendChild(sidebarItem)
            })
            sidebar.firstElementChild.click()
        })
});

function modeToLabel(mode) {
    return String(mode).split("/")[2]
}

function updateLangMode(mode) {
    editorModeElem.innerHTML = `${modeToLabel(mode).toUpperCase()}`;
}

function generateRandomId() {
    return crypto.getRandomValues(new Uint32Array(1))[0].toString(16)
}

function modeToIcon(mode) {
    return `/modes/${mode.toLowerCase()}.png`
}

let nameInputTimer = null;
let previouslyClickedItem = null;
function newFile(file) {
    let sidebarItem = document.createElement("div")
    sidebarItem.className = "item"
    sidebarItem.id = `item-${file.id}`;
    sidebarItem.addEventListener("click", () => {
        if (previouslyClickedItem) {
            previouslyClickedItem.style.backgroundColor = `transparent`;
        }
        previouslyClickedItem = sidebarItem
        previouslyClickedItem.style.backgroundColor = `rgba(255, 255, 255, 0.075)`;
        globalContextFile = file
        editor.session.setMode(file.mode)
        updateLangMode(file.mode)
        editor.setValue(file.value)
        saveButton.click()
    })
    let icon = document.createElement("img")
    icon.src = modeToIcon(modeToLabel(file.mode))
    let name = document.createElement("p")
    name.innerHTML = file.name
    name.addEventListener("click", (e) => {
        e.stopPropagation()
        name.contentEditable = true
    })
    name.spellcheck = false
    name.style.outline = "none"
    name.addEventListener("input", (ev) => {
        if (nameInputTimer) {
            clearTimeout(nameInputTimer)
        }
        nameInputTimer = setTimeout(() => {
            editorStatusElem.style.display = "none"
            let mode = modelist.getModeForPath(ev.target.innerHTML).mode;
            editor.session.setMode(mode);
            updateLangMode(mode)
            file.name = ev.target.innerHTML
            file.mode = mode
            icon.src = modeToIcon(modeToLabel(mode))
            saveButton.click()
            editorStatusElem.style.display = "block"
        }, 1000)
    })
    let share = document.createElement("i")
    share.className = "material-symbols-outlined"
    share.innerHTML = "share"
    share.addEventListener("click", (e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(`${window.location.origin}file/${file.id}`)
        showToast("File Link copied to clipboard", toastGreen)
    })
    sidebarItem.appendChild(icon)
    sidebarItem.appendChild(name)
    sidebarItem.appendChild(share)
    return sidebarItem
}

let themeCounter = 0
editorThemeElem.addEventListener("click", function() {
    var themes = ace.require("ace/ext/themelist").themes
    themes.reverse()
    if (themeCounter == themes.length - 1) {
        themeCounter = 0
    } else {
        themeCounter++
    }
    const theme = themes[themeCounter]
    editor.setTheme(`ace/theme/${theme.name}`)
    editorThemeElem.innerHTML = `${theme.caption}`
})

let saveButton = document.getElementById("save")
saveButton.addEventListener("click", () => {
    editorStatusElem.style.display = "none"
    let bodyString = JSON.stringify(globalContextFile)
    let encoder = new TextEncoder();
    if (encoder.encode(bodyString).length < maxFileSize) {
        fetch(`/api/bin/${globalContextFile.id}`, {method: "PUT", body: bodyString})
        .then((response) => {
            if (response.status == 207) {
                editorStatusElem.style.display = "block"
            }
        })
    } else {
        showToast("File size exceeded 400KB", toastRed)
    }
})

let newButton = document.getElementById("new")
newButton.addEventListener("click", () => {
    let file = {
        id: generateRandomId(),
        mode: 'ace/mode/text',
        name: "untitled",
        value: "",
        parent: globalBinId
    }
    let sidebarItem = newFile(file)
    sidebar.appendChild(sidebarItem)
    sidebarItem.click()
})

function dropHandler(ev) {
    ev.preventDefault();
    if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item, _) => {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function(e) {
                    let sidebarItem = newFile({
                        id: generateRandomId(),
                        mode: modelist.getModeForPath(file.name).mode,
                        name: file.name,
                        value: e.target.result,
                        parent: globalBinId
                    })
                    sidebar.appendChild(sidebarItem)
                    sidebarItem.click()
                }
                reader.readAsText(file);
            }
        })
    }
}

let editorWindow = document.querySelector(".editor")
editorWindow.ondrop = (e) => {
    dropHandler(e)
}
editorWindow.ondragover = (e) => {
    e.preventDefault()
}

// bottom bar link callback
editorLinkElem.addEventListener("click", () => {
    saveButton.click()
    navigator.clipboard.writeText(editorLinkElem.innerText)
    showToast("Link copied to clipboard", toastGreen)
})

// listen for edit events
let autosaveTimer = null;
let editorTextInput = document.getElementsByClassName("ace_text-input")[0]
editorTextInput.addEventListener("keydown", (e) => {
    if (autosaveTimer) {
        clearTimeout(autosaveTimer);
    }
    autosaveTimer = setTimeout(function() {
        globalContextFile.value = editor.getValue() 
        saveButton.click()
    }, 1000);
})

// check keydown event
document.addEventListener("keydown", function(e) {
    if (e.key == "Delete") {
        trashButton.click()
    }
});

// handle delete button
let trashButton = document.getElementById("trash")
trashButton.addEventListener("click", () => {
    let sidebarItem = document.getElementById(`item-${globalContextFile.id}`)
    if (sidebarItem) {
        fetch(`/api/bin/${globalContextFile.id}`, {method: "DELETE"})
        .then(() => { sidebarItem.remove() })
    }
})

// handle file upload
let filesElement = document.getElementById("files")
filesElement.addEventListener("change", () => {
    let file = filesElement.files[0]
    let mode = modelist.getModeForPath(file.name).mode;
    editor.session.setMode(mode);
    updateLangMode(mode)
    var reader = new FileReader();
    reader.onload = (e) => {
        let sidebarItem = newFile({
            id: generateRandomId(),
            mode: mode,
            name: file.name,
            value: e.target.result,
            parent: globalBinId
        })
        sidebar.appendChild(sidebarItem)
        sidebarItem.click()
    }
    reader.readAsText(file);
})

//handle upload button
let uploadButton = document.getElementById("upload")
uploadButton.addEventListener("click", () => {
    filesElement.click()
})

function showToast(innerText, color="#1c4ce4") {
    toast.innerHTML = `<p>${innerText}</p>`
    toast.style.backgroundColor = color
    toast.style.display = "flex"
    setTimeout(() => {
        toast.style.display = "none"
    }, 3000)
}
