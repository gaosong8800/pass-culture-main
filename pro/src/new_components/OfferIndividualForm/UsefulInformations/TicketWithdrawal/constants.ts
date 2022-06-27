export const TICKET_WITHDRAWAL_DEFAULT_VALUES = {
  withdrawalDetails: '',
  withdrawalType: '',
  withdrawalDelay: '',
}

export const WITHDRAWAL_TYPE = {
  withoutTicket: 'no_ticket',
  emailTicket: 'by_email',
  onPlaceTicket: 'on_site',
}

export const ticketWithdrawalTypeRadios = [
  {
    label: 'Événement sans billet',
    value: WITHDRAWAL_TYPE.withoutTicket,
  },
  {
    label: 'Envoi par e-mail',
    value: WITHDRAWAL_TYPE.emailTicket,
  },
  {
    label: 'Retrait sur place (guichet, comptoir ...)',
    value: WITHDRAWAL_TYPE.onPlaceTicket,
  },
]

export const ticketSentDateOptions = [
  {
    label: 'Date indéterminée',
    value: (0).toString(),
  },
  {
    label: '24 heures',
    value: (60 * 60 * 24).toString(),
  },
  {
    label: '48 heures',
    value: (60 * 60 * 24 * 2).toString(),
  },
  {
    label: '3 jours',
    value: (60 * 60 * 24 * 3).toString(),
  },
  {
    label: '4 jours',
    value: (60 * 60 * 24 * 4).toString(),
  },
  {
    label: '5 jours',
    value: (60 * 60 * 24 * 5).toString(),
  },
  {
    label: '6 jours',
    value: (60 * 60 * 24 * 6).toString(),
  },
  {
    label: '1 semaine',
    value: (60 * 60 * 24 * 7).toString(),
  },
]

export const ticketWithdrawalHourOptions = [
  {
    label: 'À tout moment',
    value: (0).toString(),
  },
  {
    label: '15 minutes',
    value: (60 * 15).toString(),
  },
  {
    label: '30 minutes',
    value: (60 * 30).toString(),
  },
  {
    label: '1 heure',
    value: (60 * 60).toString(),
  },
  {
    label: '2 heures',
    value: (60 * 60 * 2).toString(),
  },
  {
    label: '4 heures',
    value: (60 * 60 * 4).toString(),
  },
  {
    label: '24 heures',
    value: (60 * 60 * 24).toString(),
  },
  {
    label: '48 heures',
    value: (60 * 60 * 48).toString(),
  },
]
