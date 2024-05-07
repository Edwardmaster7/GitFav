// classe que vai trazer da api os dados do usuário do github
export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`
        
        // console.log(endpoint)
        
        return fetch(endpoint) // captura o conteúdo retornado pelo endpoint e guarda em data
            .then(data => data.json()) // converte o retorno da promise de string -> json
            .then(({ login, name, public_repos, followers }) => ({ 
                login,
                name,
                public_repos,
                followers
            }))
    }
}

// classe que vai conter a lógica dos dados
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.#load()
    }
    #load() {
        const entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
        this.entries = entries
        // this.entries = []
    }

    #checkIfIsInList(user) {
        const exists = this.entries.some(entry => entry.login === user.login);
        console.log(`checking if ${user.login} exists = ${exists}`);
        return exists;
    }

    #save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
        console.log('saved');
        console.log(`${localStorage.getItem('@github-favorites:')}`)
    }
    
    async add(username) {
        try {
            const user = await GithubUser.search(username)
            console.log(user)

            if(user.login === undefined) {
                console.log('1 - User not found!')
                throw new Error('User not found!')
            
            } else if (this.#checkIfIsInList(user) === false) {
                this.entries = [user, ...this.entries] // coloque os outros dados após o novo dado.
                console.log('2 - User added!')
            } else {
                throw new Error('User already added!')
            }
            this.update()
            this.#save()
            this.emptyTable()

        } catch(error) {
            alert(error.message)
        }
        
    }

    delete(user) {
        this.entries = this.entries.filter(entry => 
            entry.login !== user.login
        )
        this.#save()
    }

    #isEmptyTable() {
        return this.entries.length === 0 ? true : false
    }

    emptyTable() {
        const emptyTable = this.#isEmptyTable()
        const table = this.root.querySelector('.table-container')
        const tableEmptyMessage = table.querySelector('.empty-table-message')

        console.log(`emptyTable = ${emptyTable}`)

        if(emptyTable) {
            table.classList.add('empty-table')
            tableEmptyMessage.classList.remove('hide')
        } else {
            table.classList.remove('empty-table')
            tableEmptyMessage.classList.add('hide')
        }
    }

}

// classe que vai conter a lógica dos eventos e visualização
export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        // console.log(this.root)
        this.tbody = this.root.querySelector('tbody')

        this.emptyTable()
        this.update()
        this.#onadd()
    }
    
    #onadd() {
        // console.log(`onadd this.entries = ${this.entries}`)
        const addButton = this.root.querySelector('.search button')

        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            // console.log(value)
            this.add(value)
        }
    }

    update() {
        this.#removeAllTr()
        console.log(this.entries)
        this.entries.forEach( user => {
            // console.log(user)
            const row = this.#createRow()
            console.log(row)
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?')

                if(isOk) {
                    // Higher Order Function (Função que recebe outra função como parâmetro)
                    this.delete(user)
                    // console.log(this.entries)
                    this.update()
                }
            }

            this.tbody.append(row)
        })
        this.emptyTable()
    }

    #createRow() {
        const tr = document.createElement('tr')

        const content = `
            <td class="user">
                <div class="user-details">
                    <img src="https://github.com/edwardmaster7.png" alt="Imagem de edwardmaster7" target="_blank">
                    <a href="">
                        <p>Eduardo Batista</p>
                        <span>edwardmaster7</span>
                    </a>
                </div>
            </td>
            <td class="repositories">
                199
            </td>
            <td class="followers">
                7000
            </td>
            <td>
                <button class="remove">Remove</button>
            </td>
        `
        tr.innerHTML = content

        return tr
    }

    #removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        })
    }

}