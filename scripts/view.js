var editor = ace.edit("main")
editor.setReadOnly(true)
var modelist = ace.require("ace/ext/modelist");
const editorModeElem = document.querySelector("#editor-mode")
const editorThemeElem = document.querySelector("#editor-theme")
let sidebar = document.querySelector(".sidebar")
let toast = document.querySelector(".toast")
const primaryBlue = "#1c4ce4"
const toastGreen = "#27ab5a"
const toastRed = "#c32c59"
const menu = document.querySelector("#menu")
const visibilty = document.querySelector("#visibility")


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


window.addEventListener("DOMContentLoaded", async () => {
    const resp = await fetch(`/api/public/bin/${window.location.pathname.split("/")[2]}`);
    const data = await resp.json();
    if (resp.status === 200) {
        if (!data) return console.error("No data returned from server")
        data.forEach(file => {
            let sidebarItem = newFile(file)
            sidebar.appendChild(sidebarItem)
        })
        sidebar.firstElementChild.click()
    } else {
        alert(data.error)
    }
});

function modeToLabel(mode) {
    return String(mode).split("/")[2]
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
            previouslyClickedItem.style.border = `none`;
        }
        previouslyClickedItem = sidebarItem
        previouslyClickedItem.style.backgroundColor = `rgba(255, 255, 255, 0.075)`;
        previouslyClickedItem.style.border = `1px solid rgba(255, 255, 255, 0.062)`;
        globalContextFile = file
        editor.session.setMode(file.mode)
        editor.setValue(file.value)
        editorModeElem.innerHTML = `${modeToLabel(file.mode).toUpperCase()}`;
    })
    let icon = document.createElement("img")
    icon.src = modeToIcon(modeToLabel(file.mode))
    let name = document.createElement("p")
    name.innerHTML = file.name
    let share = document.createElement("i")
    share.className = "material-symbols-outlined"
    share.innerHTML = "link"
    share.addEventListener("click", (e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(`${window.location.origin}/shared/${file.id}`)
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

function showToast(innerText, color="#1c4ce4") {
    toast.innerHTML = `<p>${innerText}</p>`
    toast.style.backgroundColor = color
    toast.style.display = "flex"
    setTimeout(() => {
        toast.style.display = "none"
    }, 3000)
}
