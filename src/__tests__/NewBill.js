/**
 * @jest-environment jsdom
 */
//ajouts d'imports
import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import userEvent from '@testing-library/user-event'



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then sending my new bill, I should be to the bill page", async() => {
      window.localStorage.setItem( "user", JSON.stringify({type: "Employee"}) );
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      const currenNewBill = new NewBill({ document, onNavigate, store: null, localStorage: localStorage })

      const handleSubmit = jest.fn((e) => currenNewBill.handleSubmit(e))

      const form = screen.getByTestId("form-new-bill")
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      const isBills = screen.getByText(/Mes notes de frais/)
      expect(isBills).toBeTruthy()
    })
    test("Then adding a file to the form should call the api", async() => {
      window.localStorage.setItem( "user", JSON.stringify({type: "Employee"}) );
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      class FakeApiEntity { async update({data, headers = {}}) { return await "" } async create({data, headers = {}}) { return await "" } }
      const fakeStore = { bills : () => new FakeApiEntity()}
      const currenNewBill = new NewBill({ document, onNavigate, store: fakeStore, localStorage: localStorage })
      const fileTest = new File(['hello'], 'path\\hello.png', {type: 'image/png'})

      const handleChangeFile = jest.fn((e) => currenNewBill.handleChangeFile(e))

      const selectFile = screen.getByTestId("file")
      selectFile.addEventListener('change', handleChangeFile)
      userEvent.upload(selectFile, fileTest)

      expect(selectFile.files[0]).toStrictEqual(fileTest)
      expect(selectFile.files.item(0)).toStrictEqual(fileTest)
      expect(selectFile.files).toHaveLength(1)

    })
  })
  })

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I add a new bill", () => {
      test("Then it creates a new bill", () => {
          //page NewBill
          document.body.innerHTML = NewBillUI()
              // initialisation champs bills
          const inputData = {
                  type: 'Transports',
                  name: 'Test',
                  datepicker: '2021-05-26',
                  amount: '100',
                  vat: '10',
                  pct: '19',
                  commentary: 'Test',
                  file: new File(['test'], 'test.png', { type: 'image/png' }),
              }
              // récupération éléments de la page
          const formNewBill = screen.getByTestId('form-new-bill')
          const inputExpenseName = screen.getByTestId('expense-name')
          const inputExpenseType = screen.getByTestId('expense-type')
          const inputDatepicker = screen.getByTestId('datepicker')
          const inputAmount = screen.getByTestId('amount')
          const inputVAT = screen.getByTestId('vat')
          const inputPCT = screen.getByTestId('pct')
          const inputCommentary = screen.getByTestId('commentary')
          const inputFile = screen.getByTestId('file')

          // simulation de l'entrée des valeurs
          fireEvent.change(inputExpenseType, {
              target: { value: inputData.type },
          })
          expect(inputExpenseType.value).toBe(inputData.type)

          fireEvent.change(inputExpenseName, {
              target: { value: inputData.name },
          })
          expect(inputExpenseName.value).toBe(inputData.name)

          fireEvent.change(inputDatepicker, {
              target: { value: inputData.datepicker },
          })
          expect(inputDatepicker.value).toBe(inputData.datepicker)

          fireEvent.change(inputAmount, {
              target: { value: inputData.amount },
          })
          expect(inputAmount.value).toBe(inputData.amount)

          fireEvent.change(inputVAT, {
              target: { value: inputData.vat },
          })
          expect(inputVAT.value).toBe(inputData.vat)

          fireEvent.change(inputPCT, {
              target: { value: inputData.pct },
          })
          expect(inputPCT.value).toBe(inputData.pct)

          fireEvent.change(inputCommentary, {
              target: { value: inputData.commentary },
          })
          expect(inputCommentary.value).toBe(inputData.commentary)

          userEvent.upload(inputFile, inputData.file)
          expect(inputFile.files[0]).toStrictEqual(inputData.file)
          expect(inputFile.files).toHaveLength(1)

          // localStorage should be populated with form data
          Object.defineProperty(window, 'localStorage', {
              value: {
                  getItem: jest.fn(() =>
                      JSON.stringify({
                          email: 'email@test.com',
                      })
                  ),
              },
              writable: true,
          })

          // we have to mock navigation to test it
          const onNavigate = (pathname) => {
              document.body.innerHTML = ROUTES({ pathname })
          }

          //initialisation NewBill
          const newBill = new NewBill({
              document,
              onNavigate,
              localStorage: window.localStorage,
          })

          //déclenchement de l'événement
          const handleSubmit = jest.fn(newBill.handleSubmit)
          formNewBill.addEventListener('submit', handleSubmit)
          fireEvent.submit(formNewBill)
          expect(handleSubmit).toHaveBeenCalled()
      })
      test("Then it fails with a 404 message error", async() => {
          const html = BillsUI({ error: 'Erreur 404' })
          document.body.innerHTML = html;
          const message = await screen.getByText(/Erreur 404/);
          expect(message).toBeTruthy();
      })
      test("Then it fails with a 500 message error", async() => {
          const html = BillsUI({ error: 'Erreur 500' })
          document.body.innerHTML = html;
          const message = await screen.getByText(/Erreur 500/);
          expect(message).toBeTruthy();
      })
  })
})

