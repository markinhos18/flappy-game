function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {    // função construtora
    this.elemento = newElement('div', 'barreira')

    const borda = newElement('div', 'borda')

    const corpo = newElement('div', 'corpo')
    
    this.elemento.appendChild( reversa ? corpo : borda )

    this.elemento.appendChild( reversa ? borda : corpo )

    this.setAltura = altura => corpo.style.height = `${altura}px` 
}

// const b = new Barreira(true)
// b.setAltura(300)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)



function parBarreiras(altura, abertura, x) {
    this.elemento = newElement('div', 'barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const heightTop = Math.random() * (altura - abertura)
        const heightBottom = altura - abertura - heightTop
        this.superior.setAltura(heightTop)
        this.inferior.setAltura(heightBottom)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
    
}

// const b = new Barreira(700, 200, 400)
// document.querySelector('[wm-flappy]'). appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parBarreiras(altura, abertura, largura),
        new parBarreiras(altura, abertura, largura + espaco),
        new parBarreiras(altura, abertura, largura + espaco * 2),
        new parBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando o elemento sair da área do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouMeio) notificarPonto()
        })
    } 
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = newElement('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    
    if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        ){

            window.ontouchend = e => voando = true
            window.ontouchstart = e => voando = false

    } else {

        window.onkeydown = e => voando = true // qualquer tecla que usuario pressionar o passaro sobe
        window.onkeyup = e => voando = false // quando o usuario soltar a tecla o passaro desce

    }
        

    // window.onkeydown = e => voando = true
    // window.onkeyup = e => voando = false
    
    
    this.animar = () => {
        const newY = this.getY() + (voando ? 8 : -5)
        const alturaMax = alturaJogo - this.elemento.clientHeight

        if(newY <= 0){
            this.setY(0)
        } else if(newY >= alturaMax){
            this.setY(alturaMax)
        } else {
            this.setY(newY)
        }
    }

    this.setY(alturaJogo / 2)
}



function Progresso() {
    this.elemento = newElement('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}



// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaJogo = document.querySelector('[wm-flappy]')

// areaJogo.appendChild(passaro.elemento)
// areaJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20);

function sobrePostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function collision(passaro, barreiras) {
    let collision = false
    barreiras.pares.forEach(parBarreiras => {
        if(!collision){
            const superior = parBarreiras.superior.elemento
            const inferior = parBarreiras.inferior.elemento
            collision = sobrePostos(passaro.elemento, superior) || sobrePostos(passaro.elemento, inferior)
        }
    })
    return collision
}

function flappyBird() {
    let pontos = 0

    const areaJogo = document.querySelector('[wm-flappy]')
    const altura = areaJogo.clientHeight
    const largura = areaJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 230, 450,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaJogo.appendChild(progresso.elemento)
    areaJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {

            barreiras.animar()
            passaro.animar()

            if(collision(passaro, barreiras)){
                clearInterval(temporizador) // para o jogo quando colidir
                return location.reload(true);
            }
        }, 20);
    }

}

new flappyBird().start()