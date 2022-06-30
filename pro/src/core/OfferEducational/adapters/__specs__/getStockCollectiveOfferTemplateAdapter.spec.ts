import { getStockCollectiveOfferTemplateAdapter } from '../getStockCollectiveOfferTemplateAdapter'

describe('getStockCollectiveOfferTemplateAdapter', () => {
  describe('getStockCollectiveOfferTemplateAdapter', () => {
    it('should return an error when API returns an error', async () => {
      // given
      // @ts-ignore
      jest.spyOn(window, 'fetch').mockResolvedValueOnce({
        status: 400,
        json: async () => ({
          code: 'NO_BOOKING',
        }),
      })

      // when
      const response = await getStockCollectiveOfferTemplateAdapter('A1')

      // then
      expect(response.isOk).toBeFalsy()
      expect(response.message).toBe(
        'Une erreur est survenue lors de la récupération de votre offre'
      )
    })

    it('should not return an error when offer has been found', async () => {
      // given
      // @ts-ignore
      jest.spyOn(window, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          // @ts-ignore
          'Content-Type': 'application/json',
        }),
        json: () =>
          Promise.resolve({
            id: 'A1',
            venue: {
              managingOffererId: 'A1',
              departementCode: 'A1',
            },
            isActive: true,
            status: 'ACTIVE',
            offerId: 'A1',
          }),
      })

      // when
      const response = await getStockCollectiveOfferTemplateAdapter('A1')

      // then
      expect(response.isOk).toBeTruthy()
    })
  })
})
