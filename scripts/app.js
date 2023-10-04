const bins = document.querySelector('#bins');
const add = document.querySelector('#add');


function newBin(data) {
    let bin = document.createElement("li")
    let info = document.createElement("div")
    info.classList.add("info")
    let name = document.createElement("h4")
    name.innerText = data.name
    name.addEventListener("click", (e) => {
        e.stopPropagation()
        name.contentEditable = true
        name.focus()
    })
    name.spellcheck = false
    let nameInputTimer = null
    name.addEventListener("input", (ev) => {
        if (nameInputTimer) {
            clearTimeout(nameInputTimer)
        }
        nameInputTimer = setTimeout(() => {
            if (name.innerText.length == 0) {
                name.innerText = "Untitled"
            }
            fetch(`/api/bins`, {
                method: "PATCH",
                body: JSON.stringify({ id: data.id, name: name.innerText }),
            })
        }, 1000)
    })
    let description = document.createElement("p")
    description.innerText = data.description
    description.addEventListener("click", (e) => {
        e.stopPropagation()
        description.contentEditable = true
        description.focus()
    })
    description.spellcheck = false
    let descriptionInputTimer = null
    description.addEventListener("input", (ev) => {
        if (descriptionInputTimer) {
            clearTimeout(descriptionInputTimer)
        }
        descriptionInputTimer = setTimeout(() => {
            if (description.innerText.length == 0) {
                description.innerText = "No description"
            }
            if (description.innerText.length > 100) {
                description.innerText = description.innerText.slice(0, 100)
            }
            fetch(`/api/bins`, {
                method: "PATCH",
                body: JSON.stringify({ id: data.id, description: description.innerText }),
            })
        }, 1000)
    })
    info.appendChild(name)
    info.appendChild(description)
    let options = document.createElement("div")
    options.classList.add("options")
    let deleteButton = document.createElement("button")
    deleteButton.title = "Delete"
    deleteButton.innerHTML = `<span class="material-symbols-outlined">delete</span>`
    deleteButton.addEventListener("click", () => {
        fetch(`/api/bins`, {
            method: "DELETE",
            body: JSON.stringify({ id: data.id }),
        })
            .then(() => { bin.remove() })
    })
    let shareButton = document.createElement("button")
    shareButton.style.cursor = "copy"
    shareButton.title = "Copy Share Link"
    shareButton.innerHTML = `<span class="material-symbols-outlined">share</span>`
    shareButton.addEventListener("click", () => {
        navigator.clipboard.writeText(`${window.location.origin}/shared/${data.id}`)
    })
    let openButton = document.createElement("button")
    openButton.title = "Open Editor"
    openButton.innerHTML = `<span class="material-symbols-outlined">expand_content</span>`
    openButton.addEventListener("click", () => {
        window.location.href = `/editor/${data.id}`
    })
    options.appendChild(deleteButton)
    options.appendChild(shareButton)
    options.appendChild(openButton)
    bin.appendChild(info)
    bin.appendChild(options)
    return bin
}

add.addEventListener('click', () => {
    let bin = { 
        name: "Untitled", 
        description: "No description",
        type: "parent",
        id: crypto.randomUUID(),
    };
    fetch('/api/bins', { method: "PUT", body: JSON.stringify(bin) })
        .then(response => response.json())
        .then(data => {
            if (!data) return console.error("No data returned from server")
            bins.appendChild(newBin(bin))
        })
})


window.addEventListener('DOMContentLoaded', () => {
    fetch('/api/bins')
        .then(response => response.json())
        .then(data => {
            if (!data) return console.error("No data returned from server")
            data.forEach(bin => {
                bins.appendChild(newBin(bin))
            })
        })
});