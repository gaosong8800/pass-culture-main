import { When, Then, Given } from '@badeball/cypress-cucumber-preprocessor'

// siret of Bar des amis
let siret: string
let randomSeed: number
let venueNameWithSiret: string
let venueNameWithoutSiret: string

beforeEach(() => {
  // siret of Bar des amis
  siret = '222222233' + Math.random().toString().substring(2, 7)
  randomSeed = new Date().getTime()
  venueNameWithSiret = 'Lieu avec Siret ' + randomSeed
  venueNameWithoutSiret = 'Lieu sans Siret ' + randomSeed // just to distinguish them

  // mettre l'intercept à part?
  cy.intercept('GET', `http://localhost:5001/sirene/siret/${siret}`, (req) =>
    req.reply({
      statusCode: 200,
      body: {
        siret: siret,
        name: 'Ministère de la Culture',
        active: true,
        address: {
          street: '3 RUE DE VALOIS',
          postalCode: '75001',
          city: 'Paris',
        },
        ape_code: '90.03A',
        legal_category_code: '1000',
      },
    })
  ).as('getSiret')
  cy.visit('/connexion')
})

Given('I want to add a venue', () => {
  cy.findByLabelText('Structure').select('Bar des amis')
  cy.findByText('Ajouter un lieu').click()
})

When('I choose a venue which already has a Siret', () => {
  cy.findByText('Ce lieu possède un SIRET').click()
})

When('I add a valid Siret', () => {
  cy.findByLabelText('SIRET du lieu *').type(siret)
  cy.wait('@getSiret').its('response.statusCode').should('eq', 200)
  cy.findByTestId('error-siret').should('not.exist')
})

When('I add venue without Siret details', () => {
  cy.findByLabelText('Commentaire du lieu sans SIRET *').type(
    'Commentaire du lieu sans SIRET'
  )
  cy.findByLabelText('Raison sociale *').type(venueNameWithoutSiret)
  cy.findByLabelText('Adresse postale *')
    .type('89 Rue la Boétie 75008 Paris')
    .type('{downarrow}{enter}')
  cy.findByLabelText('Activité principale *').select('Centre culturel')
  cy.findByText('Visuel').click()
  cy.findByLabelText('Adresse email *').type('email@example.com')
})

When('I validate venue step', () => {
  cy.intercept({ method: 'POST', url: '/venues' }).as('getVenues')
  cy.findByText('Enregistrer et créer le lieu').click()
  cy.wait('@getVenues').its('response.statusCode').should('eq', 201)
})

When('I add venue with Siret details', () => {
  cy.findByLabelText('Nom public').type(venueNameWithSiret)
  cy.findByLabelText('Activité principale *').select('Festival')
  cy.findByText('Moteur').click()
  cy.findByText('Auditif').click()
  cy.findByLabelText('Adresse email *').type('email@example.com')
})

When('I skip offer creation', () => {
  cy.findByText('Plus tard').click()
})

When('I open my venue without Siret resume', () => {
  cy.reload()
  cy.findByRole('link', {
    name: 'Gérer la page de ' + venueNameWithoutSiret + '',
  }).click()
  cy.url().should('contain', 'structures').and('contain', 'lieux')
  cy.findAllByTestId('spinner').should('not.exist')
  cy.contains(venueNameWithoutSiret).should('be.visible')
})

Then('I should see my venue with Siret resume', () => {
  cy.reload()
  cy.findByRole('link', {
    name: 'Gérer la page de ' + venueNameWithSiret + '',
  }).click()
  cy.contains(venueNameWithSiret).should('be.visible')
})

When('I add an image to my venue', () => {
  cy.findByText('Ajouter une image').click()
  cy.get('input[type=file]').selectFile('cypress/data/dog.jpg', { force: true })
  cy.wait(1000) // todo: pas réussi à attendre l'image chargée
  cy.contains(
    'En utilisant ce contenu, je certifie que je suis propriétaire ou que je dispose des autorisations nécessaires pour l’utilisation de celui-ci'
  )
  cy.findByRole('button', { name: 'Suivant'}).click()
  cy.contains('Prévisualisation de votre image dans l’application pass Culture')
  cy.findByRole('button', { name: 'Enregistrer'}).click()
  cy.findByTestId('global-notification-success').should(
    'contain',
    'Vos modifications ont bien été prises en compte'
  )
})

Then('I should see details of my venue', () => {
  cy.contains(venueNameWithoutSiret)
  cy.findByRole('button', { name: 'Modifier l’image'})
})

When('I go to the venue page in Individual section', () => {
  cy.findByLabelText('Structure').select('Lieu non dit')
  cy.findByText('Vos pages partenaire').should('be.visible')
  cy.findByText('Carnet d’adresses').should('be.visible')
  cy.findByLabelText('Sélectionnez votre page partenaire *').select(
    'Cinéma de la fin Bis'
  )

  // findByText() et findByRole() marchent pas ici
  cy.contains('Gérer votre page pour le grand public').click()
  cy.findByText('Vos informations pour le grand public').should('be.visible')
  cy.findByText('À propos de votre activité').should('be.visible')
  cy.findByText('Modifier').click()

  cy.findByText('Cinéma de la fin Bis').should('be.visible')
})

When('I update Individual section data', () => {
  cy.findAllByLabelText('Description')
    .clear()
    .type('On peut ajouter des choses, vraiment fantastique !!!')
  cy.findByText('Non accessible').click()
  cy.findByText('Psychique ou cognitif').click()
  cy.findByText('Auditif').click()
  cy.intercept({ method: 'PATCH', url: '/venues/*' }).as('patchVenue')
  cy.findByText('Enregistrer et quitter').click()
  cy.wait('@patchVenue')
})

When('I go to the venue page in Paramètres généraux', () => {
  cy.findByText('Paramètres généraux').click()
  cy.findByLabelText(
    'Label du ministère de la Culture ou du Centre national du cinéma et de l’image animée'
  ).select('Musée de France')
  cy.findByLabelText('Informations de retrait')
    .clear()
    .type(
      'En main bien propres, avec un masque et un gel hydroalcoolique, didiou !'
    )
})

When('I update Paramètres généraux data', () => {
  cy.findByText('Paramètres généraux').click()
})

Then('Individual section data should be updated', () => {
  cy.findByText('Annuler et quitter').should('not.exist')
  cy.findByText('Vos informations pour le grand public').should('be.visible')
  cy.findByText('On peut ajouter des choses, vraiment fantastique !!!').should(
    'be.visible'
  )
})

Then('Paramètres généraux data should be updated', () => {
  cy.findByText('Musée de France').should('be.visible')
})
