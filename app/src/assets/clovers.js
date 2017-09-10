import BN from 'bignumber.js'
import clubTokenArtifacts from '../../../build/contracts/ClubToken.json'
import contract from 'truffle-contract'
import Web3 from 'web3'
import Reversi from './reversi'

let web3 = self && self.web3
let _web3 = false
class Clover extends Reversi {

  constructor (events = false) {
    super()
    this.error = false
    this.genesisBlock = 868317
    this.address = '0xee262da86309e4bec8504ba1af9e337b67fd49cb'
    this.ClubToken = null
    this.account = null
    this.name = null
    this.symbol = null
    this.balance = 0
    this.accountInterval = null
    this.registeredEvents = []
    this.events = events
    this.findersFee = this.startPrice = 0
  }

  // Connections

  initWeb3 () {
    console.log('init')
    web3 = self && self.web3
    let web3Provider
    if (web3) {
      // Use Mist/MetaMask's provider
      web3Provider = web3.currentProvider
      _web3 = new Web3(web3Provider)
      this.setAccountInterval()
      this.getPastEvents()
      this.watchFutureEvents()
    } else {
      this.resetConnection()
      setTimeout(() => {
        this.initWeb3()
      }, 1000)
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      // web3Provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/Q5I7AA6unRLULsLTYd6d')
      // web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
    }
  }

  resetConnection () {
    _web3 = false
    this.ClubToken = false
  }

  setAccountInterval () {
    this.accountInterval = this.accountInterval || setInterval(() => {
      this.checkAccount()
    }, 3000)
  }

  stopAccountInterval () {
    clearInterval(this.accountInterval)
  }

  checkAccount () {
    if (!_web3) this.initWeb3()
    if (!this.symbol) {
      this.getSymbol().then((symbol) => {
        this.symbol = symbol
        console.log('updateSymbol')
        window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
      }).catch((err) => console.log(err))
    }
    if (!this.name) {
      this.getName().then((name) => {
        this.name = name
        console.log('name')
        window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
      }).catch((err) => console.log(err))
    }
    if (_web3.eth.accounts && this.account !== _web3.eth.accounts[0]) {
      this.account = _web3.eth.accounts[0]
      console.log('updateAccount')
      window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
    }
    this.account && this.balanceOf().then(balance => {
      if (balance.toNumber() !== this.balance) {
        this.balance = balance.toNumber()
        console.log('updateBalance')
        window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
      }
    }).catch((err) => console.log(err))
  }

  setContract () {
    if (!_web3) this.initWeb3()
    this.ClubToken = contract(clubTokenArtifacts)
    this.ClubToken.setProvider(_web3.currentProvider)
  }

  stopEvents () {
    return this.deploy().then((instance) => {
      return instance.Registered().stopWatching()
    })
  }

  getPastEvents () {
    this.deploy().then((instance) => {
      instance.Registered({}, {fromBlock: this.genesisBlock}).get((error, result) => {
        if (error) {
          this.error = 'need-metamask'
          this.resetConnection()
        } else {
          this.error = false
          window.dispatchEvent(new CustomEvent('eventsRegistered', {detail: result}))
        }
        console.log('RegisteredUpdate')
        window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
      })
      instance.newCloverName({}, {fromBlock: this.genesisBlock}).get((error, result) => {
        if (error) {
          this.error = 'need-metamask'
          this.resetConnection()
        } else {
          this.error = false
          window.dispatchEvent(new CustomEvent('newClovernameEvents', {detail: result}))
        }
        console.log('newcloverNameUpdate')
        window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
      })
      instance.newUserName({}, {fromBlock: this.genesisBlock}).get((error, result) => {
        if (error) {
          this.error = 'need-metamask'
          this.resetConnection()
        } else {
          this.error = false
          window.dispatchEvent(new CustomEvent('newUsernameEvents', {detail: result}))
        }
        console.log('new userame update')
        window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
      })
    })
  }

  watchFutureEvents () {
    this.deploy().then((instance) => {
      instance.Registered({}, {fromBlock: 'latest'}).watch((error, result) => {
        if (error) {
          this.error = 'need-metamask'
          this.resetConnection()
        } else {
          this.error = false
          window.dispatchEvent(new CustomEvent('eventRegistered', {detail: result}))
        }
        console.log('new registered update')
        window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
      })
      instance.newCloverName({}, {fromBlock: 'latest'}).watch((error, result) => {
        if (error) {
          this.error = 'need-metamask'
          this.resetConnection()
        } else {
          this.error = false
          window.dispatchEvent(new CustomEvent('newClovernameEvent', {detail: result}))
        }
        console.log('new clover name update')
        window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
      })
      instance.newUserName({}, {fromBlock: 'latest'}).watch((error, result) => {
        if (error) {
          this.error = 'need-metamask'
          this.resetConnection()
        } else {
          this.error = false
          window.dispatchEvent(new CustomEvent('newUsernameEvent', {detail: result}))
        }
        console.log('new username update')
        window.dispatchEvent(new CustomEvent('updateCloverObject', {detail: this}))
      })
    })
  }

  deploy () {
    if (!this.ClubToken) this.setContract()
    return this.ClubToken.deployed()
  }

  // Token

  // contract read only / calls

  balanceOf (account = this.account) {
    return this.deploy().then((instance) => {
      return instance.balanceOf(account)
    })
  }

  getName () {
    return this.deploy().then((instance) => {
      return instance.name()
    })
  }

  getSymbol () {
    return this.deploy().then((instance) => {
      return instance.symbol()
    })
  }

  // contract write / transactions

  transfer (to = this.account, amount = 0) {
    return this.deploy().then((instance) => {
      return this.instance.transfer(to, new BN(amount, 10), {from: this.account})
    })
  }


  // Contract Management

  // contract read only / calls

  isAdmin () {
    return this.deploy().then((instance) => {
      return instance.isAdmin({from: this.account})
    })
  }

  adminLen () {
    return this.deploy().then((instance) => {
      return instance.adminLen().then((num) => new BN(num).toNumber())
    })
  }

  adminAt (adminKey = 0) {
    return this.deploy().then((instance) => {
      return instance.adminAt(new BN(adminKey, 10))
    })
  }

  myAddress () {
    return this.deploy().then((instance) => {
      return instance.myAddress({from: this.account})
    })
  }

  getTallys () {
    return this.deploy().then((instance) => {
      return instance.getTallys().then((result) => {
        return this.formatTallys(result)
      })
    })
  }
  

  // contract write / transactions

  addAdmin (address = '0x0') {
    return this.isAdmin().then((isAdmin) => {
      if (isAdmin) {
        return this.deploy().then((instance) => {
          return instance.addAdmin(address, {from: this.account})
        })
      } else {
        throw new Error('Can\'t addAdmin() if not an admin')
      }
    })

  }

  updateMultiplier (multiplier = 100) {
    return this.isAdmin().then((isAdmin) => {
      if (isAdmin) {
        return this.deploy().then((instance) => {
          return instance.updateMultiplier(new BN(multiplier, 10), {from: this.account})
        })
      } else {
        throw new Error('Can\'t updateModifier() if not an admin')
      }
    })
  }

  // formatting

  formatTallys (contractArray = Array(6)) {
    let tallys = {
      Symmetricals: contractArray[0].toNumber(),
      RotSym: contractArray[1].toNumber(),
      Y0Sym: contractArray[2].toNumber(),
      X0Sym: contractArray[3].toNumber(),
      XYSym: contractArray[4].toNumber(),
      XnYSym: contractArray[5].toNumber(),
      PayMultiplier: contractArray[6].toNumber()
    }
    return {tallys, findersFee: this.symmetrical && this.calcFindersFees(tallys)}
  }

  calcFindersFees (tallys = Array(), RotSym = this.RotSym, Y0Sym = this.Y0Sym, X0Sym = this.X0Sym, XYSym = this.XYSym, XnYSym = this.XnYSym) {
    let base = 0
    if(this.symmetrical && !RotSym && !Y0Sym && !X0Sym && !XYSym && !XnYSym) {
      this.isSymmetrical()
      return this.calcFindersFees(tallys)
    }

    if (RotSym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.RotSym + 1 )
    if (Y0Sym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.Y0Sym + 1 )
    if (X0Sym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.X0Sym + 1 )
    if (XYSym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.XYSym + 1 )
    if (XnYSym) base += ( tallys.PayMultiplier * ( tallys.Symmetricals + 1 ) ) / ( tallys.XnYSym + 1 )

    return Math.floor(base)
  }



  // Player Management

  // contract read only / calls

  listPlayerCount () {
    return this.deploy().then((instance) => {
      return instance.listPlayerCount().then((num) => new BN(num).toNumber())
    })
  }

  playerAddressByKey (key = 0) {
    return this.deploy().then((instance) => {
      return instance.playerAddressByKey(new BN(key, 10))
    })
  }

  playerExists (address = '0x0') {
    return this.deploy().then((instance) => {
      return instance.playerExists(address)
    })
  }

  playerCurrentCount (address = this.account) {
    return this.deploy().then((instance) => {
      return instance.playerCurrentCount(address).then((num) => new BN(num).toNumber())
    })
  }

  playerAllCount (address = '0x0') {
    return this.deploy().then((instance) => {
      return instance.playerAllCount(address).then((num) => new BN(num).toNumber())
    })
  }

  playerCloverByKey (address = '0x0', cloverKey = 0) {
    return this.deploy().then((instance) => {
      return instance.playerCloverByKey(address, new BN(cloverKey, 10))
    })
  }

  playerOwnsClover (address = '0x0', board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.playerCloverByKey(address, new BN(board, 16))
    })
  }

  // contract write / transactions

  changeName (name = '') {
    if (name === '') throw new Error('Shouldn\'t have an empty name')
    return this.deploy().then((instance) => {
      return instance.changeName(name, {from: this.account})
    })
  }




  // Clover Management

  // app calls

  register (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves, startPrice = this.startPrice, byteBoard = this.byteBoard) {
    return this.isAdmin().then((isAdmin) => {
      return this.gameExists().then((exists) => {
        if (exists) throw new Error('Game has already been mined')
        return this.deploy().then((instance) => {
          if (isAdmin) {
            return this.adminMineClover(byteFirst32Moves, byteLastMoves, byteBoard, startPrice)
          } else {
            return this.mineClover(byteFirst32Moves, byteLastMoves, startPrice)
          }
        })
      })
    })
  }

  // contract read only / calls

  cloverExists (board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.cloverExists(new BN(board, 16)).then((res) => true).catch((err) => false)
    })
  }

  getCloversCount () {
    return this.deploy().then((instance) => {
      return instance.getCloversCount().then((num) => new BN(num).toNumber())
    })
  }

  getCloverByKey (cloverKey = 0) {
    return this.deploy().then((instance) => {
      return instance.getCloverByKey(new BN(cloverKey, 10)).then((clover) => {
        return this.formatClover(clover)
      })
    })
  }

  getClover (board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getClover(new BN(board, 16)).then((clover) => {
        return this.formatClover(clover)
      })
    })
  }

  getCloverOwnersLength (board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwnersLength(new BN(board, 16)).then((num) => new BN(num).toNumber())
    })
  }

  getCloverOwner (board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwner(new BN(board, 16)).then((owner) => {
        return this.formatOwner(owner)
      })
    })
  }

  getCloverOwnerAtKeyByBoard (board = this.byteBoard, ownerKey = 0) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwnerAtKeyByBoard(new BN(board, 16), new BN(ownerKey, 10)).then((owner) => {
        return this.formatOwner(owner)
      })
    })
  }

  getCloverOwnerAtKeyByBoardKey (boardKey = 0, ownerKey = 0) {
    return this.deploy().then((instance) => {
      return instance.getCloverOwnerAtKeyByBoardKey(new BN(boardKey, 10), new BN(ownerKey, 10)).then((owner) => {
        return this.formatOwner(owner)
      })
    })
  }


  // contract write / transactions

  renameClover (board = this.byteBoard, name = '') {
    if (name === '') throw new Error('Can\'t give a clover an empty name')
    return this.cloverExists(board).then((exists) => {
      if (!exists) throw new Error('Can\'t name a clover that hasn\'t been registered')
      return this.getCloverOwner(board).then((result) => {
        if (result.owner !== this.account) throw new Error('Can\'t name a clover you don\'t own')
        return this.deploy().then((instance) => {
          return instance.renameClover(new BN(board, 16), name, {from: this.account})
        })
      })
    })
  }

  changeStartPrice (board = this.byteBoard, startPrice = 100) {
    if (!startPrice === 0) throw new Error('Can\'t give a clover a start price of 0')
    return this.cloverExists(board).then((exists) => {
      if (!exists) throw new Error('Can\'t change the price of a clover that hasn\'t been registered')
      return this.getCloverOwner(board).then((result) => {
        if (result.owner !== this.account) throw new Error('Can\'t change the price of a clover you don\'t own')
        return this.getCloverOwnersLength(board).then((len) => {
          if (len > 1) throw new Error('Can\'t change start price of an already flipped clover')
          return this.deploy().then((instance) => {
            return instance.changeStartPrice(new BN(board, 16), new BN(startPrice, 10), {from: this.account})
          })
        })
      })
    })
  }

  mineClover (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves, startPrice = 100) {
    this.playGameByteMoves(byteFirst32Moves, byteLastMoves)
    let byteBoard = this.byteBoard
    if (this.error) {
      throw new Error('Game is not valid')
    } else if (!this.complete) {
      throw new Error('Game is not complete')
    } else if (!this.symmetrical) {
      throw new Error('Game is not symmetrical')
    } else {
      return this.deploy().then((instance) => {
        return instance.mineClover(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), startPrice, {from: this.account}).then(() => byteBoard)
      })
    }
  }

  adminMineClover (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves, byteBoard = this.byteBoard, startPrice = 100) {
    return this.deploy().then((instance) => {
      return instance.adminMineClover(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), new BN(byteBoard, 16), new BN(startPrice, 10), {from: this.account}).then(() => byteBoard)
    })
  }

  flipClover (board = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.cloverExists.call(new BN(board, 16)).then((result) => {
        if (!result) {
          throw new Error('Can\'t buy a clover that hasn\'t been found')
        } else {
          return instance.flipClover(new BN(board, 16), {from: this.account} )
        }
      })
    })
  }

  // formatting

  formatOwner (contractArray = new Array(5)) {
    return {
      byteBoard: contractArray[0],
      arrayBoardRow: this.byteBoardToRowArray(contractArray[0]),
      owner: contractArray[1]
    }
  }

  formatClover (contractArray = new Array(5)) {
    return {
      byteBoard: contractArray[0],
      arrayBoardRow: this.byteBoardToRowArray(contractArray[0]),
      currentPrice: contractArray[1].mul(2).toNumber(),
      numberOfOwners: contractArray[2].toNumber(),
      mostRecentOwner: contractArray[3],
      byteFirst32Moves: contractArray[4],
      byteLastMoves: contractArray[5],
      moves: this.byteMovesToStringMoves(contractArray[4].toString(16), contractArray[5].toString(16))
    }
  }



  // Game Management

  // contract read only / calls

  gameIsValid (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    return this.deploy().then((instance) => {
      return instance.gameIsValid(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16))
    })
  }

  gameExists (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    return this.deploy().then((instance) => {
      return instance.gameExists(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16))
    })
  }

  getSymmetry (byteBoard = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getSymmetry(new BN(byteBoard, 16)).then((game) => {
        return this.formatGame(game)
      })
    })
  }

  getFindersFee (byteBoard = this.byteBoard) {
    return this.deploy().then((instance) => {
      return instance.getFindersFee(new BN(byteBoard, 16)).then((num) => new BN(num).toNumber())
    })
  }

  debugGame (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    return this.deploy().then((instance) => {
      return instance.debugGame(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16), {from: this.account})
    })
  }

  showGame (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    return this.deploy().then((instance) => {
      return instance.showGameConstant(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
        return this.formatGame(result)
      })
    })
  }

  showGame2 (byteFirst32Moves = this.byteFirst32Moves, byteLastMoves = this.byteLastMoves) {
    console.log(new BN(byteFirst32Moves, 16).toString(2))
    console.log(new BN(byteLastMoves, 16).toString(2))
    return this.deploy().then((instance) => {
      return instance.showGame2(new BN(byteFirst32Moves, 16), new BN(byteLastMoves, 16)).then((result) => {
        return this.formatGame2(result)
      })
    })
  }

  // contract write / transactions

  // (none)


  // formatting

  formatGame (contractArray = []) {
    return {
      error: contractArray[0],
      complete: contractArray[1],
      symmetrical: contractArray[2],
      RotSym: contractArray[3],
      Y0Sym: contractArray[4],
      X0Sym: contractArray[5],
      XYSym: contractArray[6],
      XnYSym: contractArray[7]
    }
  }

  formatGame2 (contractArray = []) {
    console.log(contractArray)
    return {
      board: contractArray[0],
      arrayBoardRow: this.byteBoardToRowArray(contractArray[0]),
      blackScore: new BN(contractArray[1], 16).toNumber(10),
      whiteScore: new BN(contractArray[2], 16).toNumber(10),
      currentPlayer: new BN(contractArray[3], 16).toNumber(10),
      moveKey: new BN(contractArray[4], 16).toNumber(10)
    }
  }


}

export default Clover
