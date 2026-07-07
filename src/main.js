import Handlebars from "handlebars"
import concertCardSource from "./templates/concert-card.hbs?raw"
import modalSource from "./templates/modal.hbs?raw"

let concertCardTemplate = Handlebars.compile(concertCardSource)
let modalTemplate = Handlebars.compile(modalSource)
let list = document.querySelector(".main__list")
let pages = document.querySelector(".main__pages")
let searchInput = document.querySelector(".search-input")
let countryInput = document.querySelector(".country-input")
let backdrop = document.querySelector("[data-modal]")
let API_KEY = "AGaTsNAl500hS7I3pU67AASGNmA7AFf0"
let currentPage = 0
let totalPages = 0
let eventsData = []

async function getEvents(keyword = "", country = "", page = 0) 
{

  try {

    let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&size=20&page=${page}`

        if(keyword)
        {
            url += `&keyword=${encodeURIComponent(keyword)}`
        }

        if(country) 
        {
            url += `&countryCode=${country.toUpperCase()}`
        }
        
        let response = await fetch(url)
        let data = await response.json()

        if (!data._embedded) 
        {
            list.innerHTML = "<h2>Nothing found</h2>"
            pages.innerHTML = ""
            return
        }

        currentPage = data.page.number
        totalPages = Math.min(data.page.totalPages, 29)

        eventsData = data._embedded.events.map(event => 
        ({

            id: event.id,
            name: event.name,
            image: event.images[0].url,
            date: event.dates.start.localDate,
            city: event._embedded.venues[0].city.name,
            country: event._embedded.venues[0].country.name,
            info: event.info || "No information available.",
            url: event.url

        }))

        list.innerHTML = concertCardTemplate(eventsData)
        addCardListeners()
        renderPagination(keyword, country)
    }

    catch (error) 
    {
        console.log(error)
    }

}

function renderPagination(keyword, country) 
{

    pages.innerHTML = ""

    let start = Math.max(0, currentPage - 2)
    let end = Math.min(totalPages - 1, currentPage + 2)

    if(currentPage < 2) 
    {
        start = 0
        end = Math.min(4, totalPages - 1)
    }

    if(currentPage > totalPages - 3) 
    {

        end = totalPages - 1
        start = Math.max(0, totalPages - 5)

    }

    if (start > 0) 
    {

        createButton(0, keyword, country)

        if (start === 2) 
        {
            createButton(1, keyword, country)
        }

        else if (start > 2) 
        {
            let dots = document.createElement("span")
            dots.textContent = "..."
            dots.classList.add("page__dots")
            pages.append(dots)
        }

    }

    for (let i = start; i <= end; i++) 
    {
        createButton(i, keyword, country)
    }

    if (end < totalPages - 1) 
    {

        if (end === totalPages - 3) 
        {
            createButton(totalPages - 2, keyword, country)
        }

        else if(end < totalPages - 3) 
        {
            let dots = document.createElement("span")
            dots.textContent = "..."
            dots.classList.add("page__dots")
            pages.append(dots)
        }

        createButton(totalPages - 1, keyword, country)

    }

}

function createButton(page, keyword, country) 
{

    let button = document.createElement("button")
    button.textContent = page + 1
    button.classList.add("page__btn")
    if (page === currentPage) 
    {
        button.classList.add("active")
    }
    button.addEventListener("click", () => 
    {
        getEvents(keyword, country, page)
    })
    pages.append(button)
}

function addCardListeners() 
{
    let cards = document.querySelectorAll(".concert-card")
    cards.forEach(card => 
    {
        card.addEventListener("click", () => 
        {
            let id = card.dataset.id
            let event = eventsData.find(item => item.id === id)
            openModal(event)

        })
    })

}

function openModal(event)
{

    backdrop.innerHTML = modalTemplate(event)
    backdrop.classList.remove("is-hidden")
    document.body.classList.add("no-scroll")
    let closeBtn = backdrop.querySelector("[data-modal-close]")
    closeBtn.addEventListener("click", closeModal)
    backdrop.addEventListener("click", closeBackdrop)
    document.addEventListener("keydown", escClose)

}

function closeModal() 
{
    backdrop.classList.add("is-hidden")
    backdrop.innerHTML = ""
    document.body.classList.remove("no-scroll")
    backdrop.removeEventListener("click", closeBackdrop)
    document.removeEventListener("keydown", escClose)
}

function closeBackdrop(event) 
{
    if (event.target === backdrop) 
    {
        closeModal()
    }
}

function escClose(event) 
{
    if (event.key === "Escape") 
    {
        closeModal()
    }
}

searchInput.addEventListener("input", () => 
{

    getEvents
    (
        searchInput.value.trim(),
        countryInput.value.trim(), 0
    )

})

countryInput.addEventListener("input", () =>
{

    getEvents
    (
        searchInput.value.trim(),
        countryInput.value.trim(),
        0
    )

})

getEvents()