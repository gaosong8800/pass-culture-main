import { Card } from '@material-ui/core'
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import moment from 'moment'
import React, { useState } from 'react'
import {
  Identifier,
  useAuthenticated,
  useGetOne,
  useRedirect,
} from 'react-admin'
import { useParams } from 'react-router-dom'

import { eventMonitoring } from '../../libs/monitoring/sentry'

import { BeneficiaryBadge } from './BeneficiaryBadge'
import { CheckHistoryCard } from './CheckHistoryCard'
import { ManualReviewModal } from './ManualReviewModal'
import { StatusAvatar } from './StatusAvatar'
import { StatusBadge } from './StatusBadge'
import {
  CheckHistory,
  SubscriptionItem,
  SubscriptionItemStatus,
  SubscriptionItemType,
  UserBaseInfo,
} from './types'
import { UserDetailsCard } from './UserDetailsCard'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      style={{ width: '100%' }}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const cardStyle = {
  width: '100%',
  marginTop: '20px',
  padding: 30,
}

export const UserDetail = () => {
  useAuthenticated()
  const { id } = useParams() // this component is rendered in the /books/:id path
  const redirect = useRedirect()
  const [value, setValue] = useState(1)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const { data: userBaseInfo, isLoading } = useGetOne<UserBaseInfo>(
    'public_accounts',
    { id: id as Identifier },
    // redirect to the list if the book is not found
    { onError: () => redirect('/public_users/search') }
  )

  if (isLoading) {
    return <CircularProgress size={18} thickness={2} />
  } else if (!userBaseInfo) {
    eventMonitoring.captureException(new Error('NO_USER_BASE_INFO_LOADED'), {
      extra: { id },
    })
    return <CircularProgress size={18} thickness={2} />
  }

  const { remainingCredit, initialCredit } = userBaseInfo.userCredit
  const { AGE18, UNDERAGE } = userBaseInfo.userHistory.subscriptions

  const activeBadge = <StatusBadge active={userBaseInfo.isActive} />

  const beneficiaryBadge = <BeneficiaryBadge role={userBaseInfo.roles[0]} />

  const creditProgression = (remainingCredit / initialCredit) * 100

  const digitalCreditProgression = (remainingCredit / initialCredit) * 100

  let subscriptionItems: SubscriptionItem[] = []
  let idsCheckHistory: CheckHistory[] = []

  if (AGE18?.idCheckHistory?.length > 0) {
    idsCheckHistory = AGE18.idCheckHistory
    subscriptionItems = AGE18.subscriptionItems
  } else if (UNDERAGE?.idCheckHistory?.length > 0) {
    idsCheckHistory = UNDERAGE.idCheckHistory
    subscriptionItems = UNDERAGE.subscriptionItems
  }

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Card style={cardStyle}>
        <Grid container spacing={1}>
          <Grid item xs={10}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <div>
                  <Typography variant="h5" gutterBottom component="div">
                    {userBaseInfo.lastName}&nbsp;{userBaseInfo.firstName} &nbsp;{' '}
                    {userBaseInfo.isActive && activeBadge} &nbsp;{' '}
                    {userBaseInfo.roles[0] && beneficiaryBadge}
                  </Typography>
                  <Typography variant="body1" gutterBottom component="div">
                    User ID : {userBaseInfo.id}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom component="div">
                  <strong>e-mail : </strong>
                  {userBaseInfo.email}
                </Typography>
                <Typography variant="body2" gutterBottom component="div">
                  <strong>tél : </strong>
                  {userBaseInfo.phoneNumber}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" gutterBottom component="div">
                  Crédité le :
                  {userBaseInfo.userCredit &&
                    moment(userBaseInfo.userCredit.dateCreated).format(
                      'D/MM/YYYY'
                    )}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={2}>
            <div>
              <Stack spacing={2}>
                <Button variant={'contained'} disabled>
                  Suspendre le compte
                </Button>

                <ManualReviewModal user={userBaseInfo} />
              </Stack>
            </div>
          </Grid>
        </Grid>
      </Card>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <Card style={cardStyle}>
            <Typography variant={'h5'}>
              {userBaseInfo.userCredit.remainingCredit}&euro;
            </Typography>
            <Stack
              direction={'row'}
              style={{
                width: '100%',
                justifyContent: 'space-between',
                marginTop: 12,
                marginBottom: 12,
              }}
              spacing={0}
            >
              <Typography variant={'body1'}>Crédit restant </Typography>
              <Typography variant={'body1'}>
                {userBaseInfo.userCredit.initialCredit}&euro;
              </Typography>
            </Stack>
            <LinearProgress
              style={{ width: '100%' }}
              color={'primary'}
              variant={'determinate'}
              value={creditProgression}
            />
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card style={cardStyle}>
            <Typography variant={'h5'}>
              {userBaseInfo.userCredit.remainingDigitalCredit}&euro;
            </Typography>
            <Stack
              direction={'row'}
              style={{
                width: '100%',
                justifyContent: 'space-between',
                marginTop: 12,
                marginBottom: 12,
              }}
              spacing={0}
            >
              <Typography variant={'body1'}>Crédit digital restant </Typography>
              <Typography variant={'body1'}>
                {userBaseInfo.userCredit.initialCredit}&euro;
              </Typography>
            </Stack>
            <LinearProgress
              style={{ width: '100%' }}
              color={'primary'}
              variant={'determinate'}
              value={digitalCreditProgression}
            />
          </Card>
        </Grid>
        <Grid item xs={4}>
          {/*Carte infos dossier d'importation */}
          <Card style={{ ...cardStyle, paddingBottom: 40 }}>
            <Typography variant={'h5'}>
              Dossier{' '}
              <strong>
                {idsCheckHistory[0] && idsCheckHistory[0]['type']}
              </strong>{' '}
              importé le :
            </Typography>
            <Typography variant={'h4'}>
              {idsCheckHistory[0] &&
                moment(idsCheckHistory[0]['dateCreated']).format(
                  'D/MM/YYYY à HH:mm'
                )}
            </Typography>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="fullWidth"
          >
            <Tab label="Historique du compte" {...a11yProps(0)} />
            <Tab label="Informations Personnelles" {...a11yProps(1)} />
            <Tab label="Suivi des réservations" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          Bientôt disponible
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Stack spacing={3}>
            <UserDetailsCard
              user={userBaseInfo}
              firstIdCheckHistory={idsCheckHistory[0]}
            />

            <Card style={cardStyle}>
              <Typography variant={'h5'}>
                Parcours d'inscription {beneficiaryBadge}
              </Typography>
              {subscriptionItems.length > 0 && (
                <>
                  <Grid container spacing={5} sx={{ mt: 4 }}>
                    <Grid item xs={6}>
                      <Stack
                        spacing={3}
                        direction={'row'}
                        style={{ width: '100%' }}
                      >
                        <Typography variant={'body1'}>
                          Validation email
                        </Typography>
                        <StatusAvatar
                          subscriptionItem={subscriptionItems.find(
                            subscriptionItem =>
                              subscriptionItem.type ===
                              SubscriptionItemType.EMAIL_VALIDATION
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack
                        spacing={3}
                        direction={'row'}
                        style={{ width: '100%' }}
                      >
                        <Typography variant={'body1'}>
                          Complétion Profil
                        </Typography>
                        <StatusAvatar
                          subscriptionItem={subscriptionItems.find(
                            (item: {
                              type: string
                              status: SubscriptionItemStatus
                            }) =>
                              item.type ===
                              SubscriptionItemType.PROFILE_COMPLETION
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack
                        spacing={3}
                        direction={'row'}
                        style={{ width: '100%' }}
                      >
                        <Typography variant={'body1'}>
                          Validation Téléphone
                        </Typography>
                        <StatusAvatar
                          subscriptionItem={subscriptionItems.find(
                            (item: {
                              type: string
                              status: SubscriptionItemStatus
                            }) =>
                              item.type ===
                              SubscriptionItemType.PHONE_VALIDATION
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack
                        spacing={3}
                        direction={'row'}
                        style={{ width: '100%' }}
                      >
                        <Typography variant={'body1'}>ID Check</Typography>
                        <StatusAvatar
                          subscriptionItem={subscriptionItems.find(
                            item =>
                              item.type === SubscriptionItemType.IDENTITY_CHECK
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack
                        spacing={3}
                        direction={'row'}
                        style={{ width: '100%' }}
                      >
                        <Typography variant={'body1'}>
                          Profil Utilisateur
                        </Typography>
                        <StatusAvatar
                          subscriptionItem={subscriptionItems.find(
                            item =>
                              item.type ===
                              SubscriptionItemType.PROFILE_COMPLETION
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack
                        spacing={3}
                        direction={'row'}
                        style={{ width: '100%' }}
                      >
                        <Typography variant={'body1'}>
                          Honor Statement
                        </Typography>
                        <StatusAvatar
                          subscriptionItem={subscriptionItems.find(
                            (item: {
                              type: string
                              status: SubscriptionItemStatus
                            }) =>
                              item.type === SubscriptionItemType.HONOR_STATEMENT
                          )}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </>
              )}
            </Card>
            {idsCheckHistory.map(idCheckHistory => (
              <CheckHistoryCard
                key={idCheckHistory.thirdPartyId}
                idCheckHistory={idCheckHistory}
              />
            ))}
          </Stack>
        </TabPanel>
        <TabPanel value={value} index={2}>
          Bientôt disponible
        </TabPanel>
      </Grid>
    </Grid>
  )
}
