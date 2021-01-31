const Modal = {
  toggle() {
    document.querySelector('.modal-overlay').classList.toggle('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  add: transaction => {
    Transaction.all.push(transaction)
    App.reload()
  },

  remove: index => {
    Transaction.all.splice(index, 1)
    App.reload()
  },

  incomes() {
    let income = 0
    // Pegar todas as transações
    Transaction.all.forEach(transaction => {
      // Se for maior que zero
      if( transaction.amount > 0 ) {
        // Atribui a variavel
        income += transaction.amount
      }
    })
    // Retorna a variavel
    return income
  },

  expenses() {
    let expense = 0
    // Pegar todas as transações
    Transaction.all.forEach(transaction => {
      // Se for menor que zero
      if( transaction.amount < 0 ) {
        // Atribui a variavel
        expense += transaction.amount
      }
    })
    // Retorna a variavel
    return expense
  },

  total() {
    // Soma as entradas e as saídas
    // Atribui a soma para a variavel
    const total = Transaction.incomes() + Transaction.expenses()
    
    // Retorna a variavel
    return total
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
    const amount = Utils.formatCurrency(transaction.amount)
    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
    </td>
    `
    
    return html
  },

  updateBalance() {
    document
      .querySelector("#incomeDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .querySelector("#expenseDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .querySelector("#totalDisplay")
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const Utils = {
  formatCurrency(amount) {
    const signal = Number(amount) < 0 ? '-' : ''
    amount = String(amount).replace(/\D/g, '')
    amount = Number(amount) / 100
    amount = amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return signal + amount
  },

  formatAmount(value) {
    value = Number(value) * 100
    return value
  },

  formatDate(date) {
    const splittedDate = 
      date.split("-")
      .reverse()
      .join("/")

    return splittedDate
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()
    if(
      description.trim() === "" || 
      amount.trim() === "" || 
      date.trim() === ""
      ) {
        throw new Error("Por favor, preencha todos os campos")
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      // Verificar se todas as informações foram preenchidas
      Form.validateFields()
      // Formatar os dados para Salvar
      const transaction = Form.formatValues()
      // Salvar
      Transaction.add(transaction)
      // Apagar os dados do formulario
      Form.clearFields()
      // Fechar o Modal
      Modal.toggle()
      // Atualizar a aplicação
    } catch (error) {
      alert(error.message)
    }

  },

}


const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction)
    
    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()