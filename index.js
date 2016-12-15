const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    loki = require('lokijs'),
    app = express(),
    db = new loki('db.json')

var contacts

function parseContact(contact) {
    delete contact.meta
    delete contact['$loki']

    return contact
}

app.use(cors())
app.use(bodyParser.json())

app.get('/contacts', (req, res) => {
    res.json(contacts.find({}).map(parseContact))
})

app.get('/contacts/:contactId', (req, res) => {
    let contact = contacts.findOne({id: parseInt(req.params.contactId)})

    if (contact === null) return res.status(404).send('No contact found')

    res.json(parseContact(contact))
})

app.post('/contacts', (req, res) => {
    let contact = {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address || '',
        country: req.body.country || '',
        mobile: req.body.mobile || '',
        star: req.body.star || false
    }

    contact = contacts.insert(contact)
    contact.id = contact['$loki']

    db.saveDatabase(() => res.json(parseContact(contact)))
})

app.put('/contacts/:contactId', (req, res) => {
    let contactData = {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address || '',
        country: req.body.country || '',
        mobile: req.body.mobile || '',
        star: req.body.star || false
    }

    let contact = contacts.findOne({id: parseInt(req.params.contactId)})

    if (contact === null || typeof contact === 'undefined') return res.status(404).send('No contact found')

    for (let prop in contactData) {
        if (contact.hasOwnProperty(prop) && (contactData[prop] !== null || typeof contactData[prop] !== 'undefined')) contact[prop] = contactData[prop]
    }

    db.saveDatabase(() => res.json(parseContact(contact)))
})

app.delete('/contacts/:contactId', (req, res) => {
    let contact = contacts.findOne({id: parseInt(req.params.contactId)})

    if (contact === null || typeof contact === 'undefined') return res.status(404).send('No contact found')
    
    contacts.remove(contact)

    db.saveDatabase(() => res.end())
})

app.listen(3005, () => {
    console.log('server started on 3005')

    db.loadDatabase({}, () => {
        contacts = db.getCollection('contacts')

        if (contacts === null) contacts = db.addCollection('contacts')
    })
})