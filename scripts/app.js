const bins = document.querySelector('#bins');


function newBin(data) {
    let bin = document.createElement("li")
    let info = document.createElement("div")
    info.classList.add("info")
    let name = document.createElement("h4")
    name.innerText = data.name
    let description = document.createElement("p")
    description.innerText = data.description
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
    let editButton = document.createElement("button")
    editButton.title = "Edit"
    editButton.innerHTML = `<span class="material-symbols-outlined">edit</span>`
    editButton.addEventListener("click", () => {
        // TODO: edit bin
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
    openButton.innerHTML = `<span class="material-symbols-outlined">code</span>`
    openButton.addEventListener("click", () => {
        window.location.href = `/editor/${data.id}`
    })
    options.appendChild(deleteButton)
    options.appendChild(editButton)
    options.appendChild(shareButton)
    options.appendChild(openButton)
    bin.appendChild(info)
    bin.appendChild(options)
    return bin
}


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