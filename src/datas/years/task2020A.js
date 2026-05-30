// ЭЕШ Математик 2020 он — A хувилбар
// Answer keys: 0/36 filled ❌ TODO: fill answer keys

const task2020A = {
id: "14",
            variant: "A",
            problem: [
                {
                    id: "1",
                    text: `Утгыг олоорой:<math className="font-semibold text-xl ml-2"><mo>(</mo><mfrac><mn>1</mn><mn>6</mn></mfrac><mo>-</mo><mfrac><mn>1</mn><mn>7</mn></mfrac><mo>)</mo><mo>⋅</mo><mn>42</mn><mo>=</mo></math>`,
                    labelA: `<math className="font-semibold text-xl mr-2"><mrow><mfrac><mn>1</mn><mn>3</mn></mfrac></mrow></math>`,
                    labelB: "1",
                    labelC: "2",
                    labelD: `<math className="font-semibold text-xl mr-2"><mrow><mfrac><mn>1</mn><mn>7</mn></mfrac></mrow></math>`,
                    labelE: `<math className="font-semibold text-xl mr-2"><mrow><mfrac><mn>1</mn><mn>6</mn></mfrac></mrow></math>`,
                    answer: ""
                },
                {
                    id: "2",
                    text: "A(3; 1) цэгийг y = x шулууны хувьд тэгш хэмтэй хувиргахад гарах дүрийн координатыг ол.",
                    labelA: "(-1; 3)",
                    labelB: "(3; -1)",
                    labelC: "(1; 3)",
                    labelD: "(3; 1)",
                    labelE: "(-1; -3)",
                    answer: ""
                },
                {
                    id: "3",
                    text: "Хоккейн багийн 15 тоглогчийн авсан оноог дор харуулсан бол тоглогчдын онооны моодыг ол. <br>1,0,2,4,0,1,1,1,2,5,3,0,4,2,2</br>",
                    labelA: "0",
                    labelB: "0 ба 1",
                    labelC: "2",
                    labelD: "1 ба 2",
                    labelE: "1",
                    answer: ""
                },
                {
                    id: "4",
                    text: "y = 2x + 1 функцийн урвуу функц аль нь вэ? ",
                    labelA: `<math className="font-semibold text-xl mr-2"><mn>y</mn><mo>=</mo><mfrac><mrow><mn>x</mn><mo>-</mo><mn>1</mn></mrow><mn>2</mn></mfrac></mrow></math>`,
                    labelB: `<math className="font-semibold text-xl mr-2"><mrow><mn>y</mn><mo>=</mo><mfrac><mn>1</mn><mrow><mn>2</mn><mn>x</mn><mo>+</mo><mn>1</mn></mrow></mfrac></mrow></math>`,
                    labelC: `<math className="font-semibold text-xl mr-2"><mn>y</mn><mo>=</mo><mfrac><mrow><mn>y</mn><mo>-</mo><mn>1</mn></mrow><mn>2</mn></mfrac></mrow></math>`,
                    labelD: `<math className="font-semibold text-xl mr-2"><mrow><mn>y</mn><mo>=</mo><mn>2x</mn><mo>-</mo><mn>1</mn></mrow></math>`,
                    labelE: `<math className="font-semibold text-xl mr-2"><mrow><mn>y</mn><mo>=</mo><mfrac><mrow><mn>x</mn><mo>+</mo><mn>1</mn></mrow><mn>2</mn></mfrac></mrow></math>`,
                    answer: ""
                },
                {
                    id: "5",
                    text: `<math className="font-semibold text-xl mr-2"><mfrac><mn>ab</mn><mrow><mn>a</mn><mo>+</mo><mn>b</mn></mrow></mfrac><mo>⋅</mo><mo>(</mo><mfrac><mn>b</mn><mn>a</mn></mfrac><mo>-</mo><mfrac><mn>a</mn><mn>b</mn></mfrac><mo>)</mo></math>илэрхийллийг хялбарчил.`,
                    labelA: `<math className="font-semibold text-xl mr-2"><mfrac><mn>1</mn><mrow><mn>b</mn><mo>-</mo><mn>a</mn></mrow></mfrac></math>`,
                    labelB: `<math className="font-semibold text-xl mr-2"><mn>b</mn><mo>+</mo><mn>a</mn></math>`,
                    labelC: `<math className="font-semibold text-xl mr-2"><mn>a</mn><mo>-</mo><mn>b</mn></math>`, 
                    labelD: "1",
                    labelE: `<math className="font-semibold text-xl mr-2"><mn>b</mn><mo>-</mo><mn>a</mn></math>`,
                    answer: ""
                },
                {
                    id: "6",
                    text: "Зурагт дүрслэгдсэн олонлогийн будагдсан хэсгийг тодорхойл.",
                    labelA: `<math className="font-semibold text-xl mr-2"><mn>A</mn><mo>∩</mo><mover><mi>B</mi><mo accent="true">¯</mo></mover></math>`,
                    labelB: `<math className="font-semibold text-xl mr-2"><mn>A</mn><mo>∪</mo><mover><mi>B</mi><mo accent="true">¯</mo></mover></math>`,
                    labelC: `<math className="font-semibold text-xl mr-2"><mover><mi>A</mi><mo accent="true">¯</mo></mover><mo>U</mo><mn>B</mn></math>`,
                    labelD: `<math className="font-semibold text-xl mr-2"><mover><mi>A</mi><mo accent="true">¯</mo></mover><mo>∩</mo><mn>B</mn></math>`,
                    labelE: `<math className="font-semibold text-xl mr-2"><mi>A</mi><mo>∩</mo><mn>B</mn></math>`,
                    img: "/14a6.png",
                    answer: ""
                },
                {
                    id: "7",
                    text: `<P><math className="font-semibold text-xl mr-2"><msub><mn>a</mn><mn>n+1</mn></msub><mo>=</mo><mn>2</mn><msub><mn>a</mn><mn>n</mn></msub><mo>+</mo><mn>1</mn></math>дарааллын
                    <math className="font-semibold text-xl mr-2"><msub><mn>a</mn><mn>1</mn></msub><mo>=</mo><mn>1</mn></math>бол <math className="font-semibold text-xl ml-2 mr-2"><msub><mn>a</mn><mn>4</mn></msub></math>хэд вэ?`,
                    labelA: "9",
                    labelB: "7",
                    labelC: "15",
                    labelD: "31",
                    labelE: "14",
                    answer: ""
                },
                {
                    id: "8",
                    text: `<math className="font-semibold text-xl mr-2"><mover><mi>a</mi><mo accent="true">→</mo></mover><mo>(</mo><mn>2</mn><mo>;</mo><mn>-1</mn><mo>;</mo><mn>3</mn><mo>)</mo><mo>,</mo><mover><mi>b</mi><mo accent="true">→</mo></mover><mo>(</mo><mn>-1</mn><mo>;</mo><mn>y</mn><mo>;</mo><mn>4</mn><mo>)</mo></math>ба
                    <math className="font-semibold text-xl ml-2 mb-1 mr-2"><mover><mi>a</mi><mo>→</mo></mover><mo>,</mo><mover><mi>b</mi><mo>→</mo></mover></math>векторууд перпендикуляр бол y −ийн утгыг ол.`,
                    labelA: "9",
                    labelB: "7",
                    labelC: "-10",
                    labelD: "10",
                    labelE: "0",
                    answer: ""
                },
                {
                    id: "9",
                    text: `f(x)=<math className="font-semibold text-xl mr-2"><msup><mrow><mo>(</mo><mn>3</mn><mo>-</mo><mn>x</mn><mo>)</mo></mrow><mn>6</mn></msup></math>бол f′(x)−ийг ол.`,
                    labelA:  `<math className="font-semibold text-xl mr-2"><mn>-6</mn><mo>⋅</mo><msup><mrow><mo>(</mo><mn>3</mn><mo>-</mo><mn>x</mn><mo>)</mo></mrow><mn>5</mn></msup></math>`,
                    labelB: `<math className="font-semibold text-xl mr-2"><mn>6</mn><mo>⋅</mo><msup><mrow><mo>(</mo><mn>3</mn><mo>-</mo><mn>x</mn><mo>)</mo></mrow><mn>5</mn></msup></math>`,
                    labelC: `-<math className="font-semibold text-xl mr-2"><mfrac><mrow><msup><mrow><mo>(</mo><mn>3</mn><mo>-</mo><mn>x</mn><mo>)</mo></mrow><mn>5</mn></msup></mrow><mn>6</mn></mfrac></math>`,
                    labelD:  `-<math className="font-semibold text-xl mr-2"><mfrac><mrow><msup><mrow><mo>(</mo><mn>3</mn><mo>-</mo><mn>x</mn><mo>)</mo></mrow><mn>5</mn></msup></mrow><mn>6</mn></mfrac></math>`,
                    labelE:  `-<math className="font-semibold text-xl mr-2"><mfrac><mrow><msup><mrow><mo>(</mo><mn>3</mn><mo>-</mo><mn>x</mn><mo>)</mo></mrow><mn>5</mn></msup></mrow><mn>7</mn></mfrac></math>`,
                    answer: ""
                },
                {
                    id: "10",
                    text: `<math className="font-semibold text-xl mb-2 mr-2"><msup><mrow><mo>(</mo><mn>5</mn><msqrt><mn>2</mn></msqrt><mo>-</mo><mn>3</mn><msqrt><mn>2</mn></msqrt><mo>)</mo></mrow><mrow><mfrac><mn>4</mn><mn>3</mn></mfrac></mrow></msup></math>илэрхийллийн утга аль вэ?`,
                    labelA: `<math className="font-semibold text-xl mr-2"><msup><mn>2</mn><mrow><mfrac><mn>1</mn><mn>3</mn></mfrac></mrow></msup></math>`,
                    labelB: "2",
                    labelC: `<math className="font-semibold text-xl mr-2"><mn>2</mn><msqrt><mn>2</mn></msqrt></math>`,
                    labelD: `<math className="font-semibold text-xl mr-2"><msup><mn>4</mn><mrow><mfrac><mn>1</mn><mn>3</mn></mfrac></mrow></msup></math>`,
                    labelE: "4",
                    answer: ""
                },
                {
                    id: "11",
                    text: `−1 < a < 0 ба 0 < b < 1 бол −a ба<math className="font-semibold text-xl ml-2 mr-2"><mfrac><mn>1</mn><mn>b</mn></mfrac></math>-г ол.`,
                    labelA:  `<math className="font-semibold text-xl ml-2 mr-2"><mn>-a</mn><mo>=</mo><mfrac><mn>1</mn><mn>b</mn></mfrac></math>`,
                    labelB: `<math className="font-semibold text-xl ml-2 mr-2"><mn>-a</mn><mo>></mo><mfrac><mn>1</mn><mn>b</mn></mfrac></math>`,
                    labelC: `<math className="font-semibold text-xl ml-2 mr-2"><mn>-a</mn><mo>≥</mo><mfrac><mn>1</mn><mn>b</mn></mfrac></math>`,
                    labelD: `<math className="font-semibold text-xl ml-2 mr-2"><mn>-a</mn><mo><</mo><mfrac><mn>1</mn><mn>b</mn></mfrac></math>`,
                    labelE: `<math className="font-semibold text-xl ml-2 mr-2"><mn>-a</mn><mo>≤</mo><mfrac><mn>1</mn><mn>b</mn></mfrac></math>`,
                    answer: ""
                },
                {
                    id: "12",
                    text: `<p>f(x)=<math className="font-semibold text-xl ml-2 mr-2"><mrow><mo>{</mo><mtable><mtr><mtd><msup><mi>x</mi><mn>2</mn></msup><mo>,</mo><mn>0</mn><mo>≤</mo><mi>x</mi><mo>≤</mo><mn>1</mn></mtd></mtr><mtr><mtd><mi>x</mi><mo>+</mo><mn>1</mn><mo>,</mo><mn>1</mn><mo>≤</mo><mi>x</mi><mo>≤</mo><mn>5</mn></mtd></mtr></mtable></mrow></math>
                    функцийн дүрийг (функцийн авч болох утгуудын олонлог) олоорой.</p>`,
                    labelA: "[0;2]",
                    labelB: "[0; 2[ ∪ ]2; 4]",
                    labelC: "[0; 4]",
                    labelD: "]0;4[",
                    labelE: "]2; 4]",
                    img: "/14a12.png",
                    answer: ""
                },
                {
                    id: "13",
                    text: `<math className="font-semibold text-xl mr-2"><mrow><mo>{</mo><mtable><mtr><mtd><msup><mn>5</mn><mi>x</mi></msup><mo>+</mo><msup><mn>3</mn><mi>y</mi></msup><mo>=</mo><mn>28</mn></mtd></mtr><mtr><mtd><msup><mn>5</mn><mi>x</mi></msup><mo>−</mo><msup><mn>3</mn><mi>y</mi></msup><mo>=</mo><mn>22</mn></mtd></mtr></mtable></mrow></math>
                    бол x ∙ y үржвэрийг олоорой.`,
                    labelA: "0.5",
                    labelB: "2",
                    labelC: "6",
                    labelD: "4",
                    labelE: "3",
                    answer: ""
                },
                {
                    id: "14",
                    text: `<math className="font-semibold text-xl mr-2"><msqrt><mn>b</mn><mo>(</mo><msqrt><mn>a</mn></msqrt><mo>+</mo><msqrt><mn>a</mn><mo>-</mo><mn>b</mn></msqrt><mo>)</mo><mo>(</mo><msqrt><mn>a</mn></msqrt><mo>-</mo><msqrt><mn>a</mn><mo>-</mo><mn>b</mn></msqrt><mo>)</mo></msqrt></math>
                    илэрхийллийг хялбарчлаарай. Энд 0 ≤ b ≤ a`,
                    labelA: "a",
                    labelB:  `<math className="font-semibold text-xl ml-2 mr-2"><mn>b</mn><msqrt><mn>2</mn></msqrt></math>`,
                    labelC: "-b",
                    labelD: "b",
                    labelE:  `<math className="font-semibold text-xl ml-2 mr-2"><msqrt><mn>ab</mn></msqrt></math>`,
                    answer: ""
                },
                {
                    id: "15",
                    text: "y = 2x + 5 шулуунтай перпендикуляр бөгөөд координатын эхийг дайрсан шулууны тэгшитгэлийг бичээрэй. ",
                    labelA: `<math className="font-semibold text-xl ml-2 mr-2"><mn>y</mn><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mn>x</mn></math>`,
                    labelB: `<math className="font-semibold text-xl ml-2 mr-2"><mn>y</mn><mo>=</mo><mn>-2x</mn></math>`,
                    labelC: `<math className="font-semibold text-xl ml-2 mr-2"><mn>y</mn><mo>=</mo><mo>-</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mn>x</mn></math>`,
                    labelD: `<math className="font-semibold text-xl ml-2 mr-2"><mn>y</mn><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mn>x</mn><mo>+</mo><mn>1</mn></math>`,
                    labelE: `<math className="font-semibold text-xl ml-2 mr-2"><mn>y</mn><mo>=</mo><mn>2x</mn></math>`,
                    answer: ""
                },
                {
                    id: "16",
                    text: "|x − 2| = |x − 3| + 2 тэгшитгэл хэдэн шийдтэй вэ?",
                    labelA: "1 шийдтэй",
                    labelB: " шийдгүй",
                    labelC: "2 шийдтэй",
                    labelD: "3шийдтэй",
                    labelE: "хязгааргүй болон шийдтэй",
                    answer: ""
                },
                {
                    id: "17",
                    text: "0° < x ≤ 45°° бол sinx ба cosx −ийг жишээрэй.",
                    labelA:  "sinx = cosx",
                    labelB: "sinx ≤ cosx",
                    labelC: "sinx < cosx",
                    labelD: "sinx ≥ cosx",
                    labelE: "sinx < cosx",
                    answer: ""
                },
                {
                    id: "18",
                    text: `<math className="font-semibold text-xl mr-2"><mrow><mn>A</mn><mo>=</mo><mo>(</mo><mtable><mtr><mtd><mi>4</mi></mtd><mtd><mi>1</mi></mtd></mtr><mtr><mtd><mi>6</mi></mtd><mtd><mi>2</mi></mtd></mtr></mtable><mo>)</mo></mrow></math> бол
                    <math className="font-semibold text-xl ml-2 mr-2"><mn>4</mn><msup><mn>A</mn><mn>-1</mn></msup><mo>+</mo><mn>A</mn></math>-г ол.`,
                    labelA:  `<math className="font-semibold text-xl mr-2"><mrow><mo>(</mo><mtable><mtr><mtd><mi>8</mi></mtd><mtd><mi>-1</mi></mtd></mtr><mtr><mtd><mi>-6</mi></mtd><mtd><mi>10</mi></mtd></mtr></mtable><mo>)</mo></mrow></math>`,
                    labelB: `<math className="font-semibold text-xl mr-2"><mrow><mo>(</mo><mtable><mtr><mtd><mi>4</mi></mtd><mtd><mi>-2</mi></mtd></mtr><mtr><mtd><mi>-6</mi></mtd><mtd><mi>4</mi></mtd></mtr></mtable><mo>)</mo></mrow></math>`,
                    labelC: `<math className="font-semibold text-xl mr-2"><mrow><mo>(</mo><mtable><mtr><mtd><mi>1</mi></mtd><mtd><mi>0.5</mi></mtd></mtr><mtr><mtd><mi>-3</mi></mtd><mtd><mi>2</mi></mtd></mtr></mtable><mo>)</mo></mrow></math>`,
                    labelD: `<math className="font-semibold text-xl mr-2"><mrow><mo>(</mo><mtable><mtr><mtd><mi>8</mi></mtd><mtd><mi>-1</mi></mtd></mtr><mtr><mtd><mi>0</mi></mtd><mtd><mi>6</mi></mtd></mtr></mtable><mo>)</mo></mrow></math>`,
                    labelE: `<math className="font-semibold text-xl mr-2"><mrow><mo>(</mo><mtable><mtr><mtd><mi>8</mi></mtd><mtd><mi>-11</mi></mtd></mtr><mtr><mtd><mi>4</mi></mtd><mtd><mi>10</mi></mtd></mtr></mtable><mo>)</mo></mrow></math>`,
                    answer: ""
                },
                {
                    id: "19",
                    text: `<p>f(x)=<math className="font-semibold text-xl ml-2 mr-2"><msup><mn>x</mn><mn>3</mn></msup><mo>+</mo><mn>m</mn><msup><mn>x</mn><mn>2</mn></msup><mo>-</mo><mn>x</mn><mo>+</mo><mn>2</mn></math>олон гишүүнтийн язгуурууд нь
                    <math className="font-semibold text-xl ml-2 mr-2"><msub><mn>x</mn><mn>1</mn></msub><mo>=</mo><mn>2</mn><mo>;</mo><msub><mn>x</mn><mn>2</mn></msub><mo>;</mo><msub><mn>x</mn><mn>3</mn></msub></math>бол
                    <math className="font-semibold text-xl ml-2 mr-2"><msub><mn>x</mn><mn>1</mn></msub><mo>+</mo><msub><mn>x</mn><mn>2</mn></msub><mo>+</mo><msub><mn>x</mn><mn>3</mn></msub></math>хэд вэ?</p>`,
                    labelA: "− 1",
                    labelB: "3",
                    labelC: "2",
                    labelD: "0",
                    labelE: "− 2",
                    answer: ""
                },
                {
                    id: "20",
                    text: "Зураг дээр f(x) функцийн уламжлал болох f′(x) функцийн график [−2; 3.5] завсарт өгөв. Энэ завсарын ямар утганд f(x) функц хамгийн бага утгаа авах вэ?",
                    labelA: "x=1.5",
                    labelB: "x=-2",
                    labelC: "x=-0.5",
                    labelD: "x=3",
                    labelE: "x=3.5",
                    img: "/14a20.png",
                    answer: ""
                },
                {
                    id: "21",
                    text: `Хэрэв<math className="font-semibold text-xl ml-2 mr-2"><mrow><msubsup><mo>∫</mo><mi>3</mi><mi>0</mi></msubsup><mn>f</mn><mo>(</mo><mn>x</mn><mo>)</mo><mi>d</mi><mi>x</mi></mrow></math> бол <math className="font-semibold text-xl ml-2 mr-2"><mrow><msubsup><mo>∫</mo><mi>3</mi><mi>0</mi></msubsup><mo>(</mo><mn>f</mn><mo>(</mo><mn>x</mn><mo>)</mo><mi>d</mi><mi>x</mi><mo>+</mo><mn>2x</mn><mo>+</mo><mn>3</mn><mo>)</mo></mrow></math>
                    -ийн утгыг ол.`,
                    labelA: "24",
                    labelB: "17",
                    labelC: "14",
                    labelD: "33",
                    labelE: "23",
                    answer: ""
                },
                {
                    id: "22",
                    text: "1,2,3,4,5 гэсэн дугаартай таван картыг хэрэглэн цифрүүд нь өсөх гурван оронтой тоо хэдийг зохиож болох вэ?",
                    labelA: "10",
                    labelB: "15",
                    labelC: "6",
                    labelD: "9",
                    labelE: "8",
                    answer: ""
                },
                {
                    id: "23",
                    text: "AD, BC суурьтай ABCD трапецийн A ба B оройн биссектрисүүдийн огтлолцлын цэг K байв. ABK гурвалжныг багтаасан тойргийн радиус R = 3 бол AB талын уртыг ол. ",
                    labelA: "3",
                    labelB: `<math className="font-semibold text-xl ml-2 mr-2"><mn>2</mn><msqrt><mn>3</mn></msqrt></math>`,
                    labelC: "6",
                    labelD: "9",
                    labelE: "12",
                    answer: ""
                },
                {
                    id: "24",
                    text: "Дугуйг өнцгүүд нь арифметик прогресс үүсгэдэг байхаар таван секторт хуваажээ. Хэрэв хамгийн том секторын өнцөг нь хамгийн бага секторын өнцгөөс 5 дахин их бол хамгийн том секторын өнцгийг ол. ",
                    labelA: "24°",
                    labelB: "120°",
                    labelC: "72°",
                    labelD: "180°",
                    labelE: "96°",
                    answer: ""
                },
                {
                    id: "25",
                    text: `<p><math className="font-semibold text-xl mr-2"><mn>y</mn><mo>=</mo><msup><mn>x</mn><mn>5</mn></msup></math> функцийн грацик дээр орших P цэгийн Ox, Oy тэнхлэгт буулгасан
                    перпендикуляр суурь харгалзан A, B бол OAPB тэгш өнцөгтийн талбайг<math className="font-semibold text-xl ml-2 mr-2"><mn>y</mn><mo>=</mo><msup><mn>x</mn><mn>5</mn></msup></math>функцийн график ямар харьцаагаар хуваах вэ?</p>`,
                    labelA: "6: 1",
                    labelB: "5: 6",
                    labelC: "4: 5",
                    labelD: "5: 1",
                    labelE: "1: 2",
                    img: "/14a25.png",
                    answer: ""
                },
                {
                    id: "26",
                    text: `<math className="font-semibold text-xl mr-2"><mrow><mo>(</mo><mtable><mtr><mtd><mi>0</mi></mtd><mtd><mi>-1</mi></mtd></mtr><mtr><mtd><mi>1</mi></mtd><mtd><mi>0</mi></mtd></mtr></mtable><mo>)</mo></mrow></math>матриц ямар хувиргалтыг тодорхойлох вэ?`,
                    labelA: "төвийн тэгш хэм",
                    labelB: "гомотет",
                    labelC: "тэнхлэгийн тэгш хэм",
                    labelD: "параллел зөөлт",
                    labelE: "эргүүлэлт",
                    answer: ""
                },
                {
                    id: "27",
                    text: `<p>x ≥ m үед f(x)=<math className="font-semibold text-xl ml-2 mr-2"><mn>3</mn><msup><mn>x</mn><mn>2</mn></msup><mo>-</mo><mn>6</mn><mn>x</mn><mn>3</mn><mo>+</mo><mn>2</mn></math>бол <math className="font-semibold text-xl ml-2 mr-2"><mrow><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mi>d</mi><mi>x</mi></mrow></math> гэж тодорхойлогдсон функц харилцан нэгэн утгатай бол m −ийн хамгийн бага утгыг олоорой. </p>`,
                    labelA: "3",
                    labelB: "-1",
                    labelC: "2",
                    labelD: "1",
                    labelE: `<math className="font-semibold text-xl ml-2 mr-2"><mfrac><mn>1</mn><mn>3</mn></mfrac></math>`,
                    answer: ""
                },
                {
                    id: "28",
                    text: `<p>Q(x) = x + 2 олон гишүүнт нь P(x) = <math className="font-semibold text-xl ml-2 mr-2"><mn>2</mn><msup><mn>x</mn><mn>3</mn></msup><mo>-</mo><msup><mn>x</mn><mn>2</mn></msup><mo>-</mo><mn>4</mn><mn>x</mn><mo>+</mo><mn>2</mn></math>олон гишүүнтийг хуваадаг бол ноогдвор олон гишүүнтийн коэффициентүүдийн нийлбэрийг ол.  </p>`,
                    labelA: "3",
                    labelB: "6",
                    labelC: "0",
                    labelD: "-1",
                    labelE: "5",
                    answer: ""
                },
                {
                    id: "29",
                    text: "Зурагт y = a + bsinx функцийн график өгөгджээ. Зураг ашиглан a ∙ b үржвэрийг олоорой.  ",
                    labelA: "2",
                    labelB: "1",
                    labelC: "8",
                    labelD: "4",
                    labelE: "-4",
                    img: "/14a29.png",
                    answer: ""
                },
                {
                    id: "30",
                    text: `<math className="font-semibold text-xl ml-2 mr-2"><mfrac><mrow><mn>3x</mn><mo>+</mo><mn>2</mn></mrow><mrow><msup><mn>x</mn><mn>2</mn></msup><mo>(</mo><mn>x</mn><mo>+</mo><mn>1</mn><mo>)</mo></mrow></mfrac><mo>=</mo><mfrac><mn>A</mn><mn>x</mn></mfrac><mo>+</mo><mfrac><mn>B</mn><mrow><msup><mn>x</mn><mn>2</mn></msup></mrow></mfrac><mo>+</mo><mfrac><mn>C</mn><mrow><mn>x</mn><mo>+</mo><mn>1</mn></mrow></mfrac></math>
                    бол A + B + C-ийг олоорой.`,
                    labelA: "2",
                    labelB: "4",
                    labelC: "3",
                    labelD: "5",
                    labelE: "-5",
                    answer: ""
                },
                {
                    id: "31",
                    text: "ABCD параллелограммын AB тал y = 3x тэгшитгэлтэй, AD тал нь 4y = x + 11 тэгшитгэлтэй. AC ба BD диагоналиудын нь E(6.5; 8.5) цэгт огтлолцдог бол C цэгийн координатыг олоорой",
                    labelA: "(13; 17)",
                    labelB: "(1; 3)",
                    labelC: "(6; 8)",
                    labelD: "(12; 14)",
                    labelE: "(8; 10)",
                    img: "/14a31.png",
                    answer: ""
                },
                {
                    id: "32",
                    text: "20 сурагч нэгэн геометрийн бодлого боджээ. Тэдний зарцуулсан хугацааг бүлэглэсэн давтамжийн хүснэгтээр харуулав. Сурагчдын уг бодлогыг бодсон хугацааны арифметик дунджийг, интервалын дунджийг нь ашиглан тооцоолоорой. ",
                    labelA: "6.4",
                    labelB: "5.1",
                    labelC: "7",
                    labelD: "5.7",
                    labelE: "7.75",
                    img: "/14a32.png",
                    answer: ""
                },
                {
                    id: "33",
                    text: "A хайрцагт 4, 5, 8 дугаартай гурван бөмбөг, B хайрцагт 1, 3, 6, 8, 8 дугаартай таван бөмбөг, C хайрцагт 7 ,8, 8, 8, 8, 9 дугаартай зургаан бөмбөг байв. Хайрцагт тус бүрээс санамсаргүйгээр нэг нэг бөмбөг сонгоход яг хоёр бөмбөг нь ижил дугаартай байх магадлаллыг ол.",
                    labelA: `<math className="font-semibold text-xl ml-2 mr-2"><mfrac><mn>8</mn><mn>45</mn></mfrac></math>`,
                    labelB: `<math className="font-semibold text-xl ml-2 mr-2"><mfrac><mn>39</mn><mn>45</mn></mfrac></math>`,
                    labelC: `<math className="font-semibold text-xl ml-2 mr-2"><mfrac><mn>16</mn><mn>45</mn></mfrac></math>`,
                    labelD: `<math className="font-semibold text-xl ml-2 mr-2"><mfrac><mn>2</mn><mn>9</mn></mfrac></math>`,
                    labelE: `<math className="font-semibold text-xl ml-2 mr-2"><mfrac><mn>14</mn><mn>45</mn></mfrac></math>`,
                    answer: ""
                },
                {
                    id: "34",
                    text: `<p>r + h = 6 байх радиустай, ℎ өндөртэй цилиндрийн эзэлхүүн хамгийн их утгыг ол.<math className="font-semibold text-xl ml-2 mr-2"><mo>(</mo><mn>V</mn><mo>=</mo><mn>π</mn><msup><mn>r</mn><mn>2</mn></msup><mn>h</mn><mo>)</mo></math></p>`,
                    labelA: "0",
                    labelB: "32π",
                    labelC: "16π",
                    labelD: "8π",
                    labelE: "48π",
                    answer: ""
                },
                {
                    id: "35",
                    text: `<p>OACB квадратын AC талын дундаж цэг M ба AB диагональ OM хэрчимтэй P цэгт огтлолцдог. Хэрэв <math className="font-semibold text-xl mr-2"><mover><mi>OA</mi><mo accent="true">→</mo></mover><mo>=</mo><mover><mi>a</mi><mo accent="true">→</mo></mover><mo>,</mo><mover><mi>OB</mi><mo accent="true">→</mo></mover><mo>=</mo><mover><mi>b</mi><mo accent="true">→</mo></mover></math>бол 
                    <math className="font-semibold text-xl mr-2"><mover><mi>OP</mi><mo accent="true">→</mo></mover></math> - ийг <math className="font-semibold text-xl mr-2"><mover><mi>a</mi><mo accent="true">→</mo></mover><mo>,</mo><mover><mi>b</mi><mo accent="true">→</mo></mover></math>- ээр илэрхийл.</p>`,
                    labelA:  `<math className="font-semibold text-xl mr-2"><mover><mi>a</mi><mo accent="true">→</mo></mover><mo>+</mo><mover><mi>b</mi><mo accent="true">→</mo></mover></math> `,
                    labelB: `<math className="font-semibold text-xl mr-2"><mfrac><mrow><mn>2</mn><mover><mi>a</mi><mo accent="true">→</mo></mover><mo>+</mo><mover><mi>b</mi><mo accent="true">→</mo></mover></mrow><mn>2</mn></mfrac></math>`,
                    labelC: `<math className="font-semibold text-xl mr-2"><mfrac><mrow><mover><mi>a</mi><mo accent="true">→</mo></mover><mo>+</mo><mn>2</mn><mover><mi>b</mi><mo accent="true">→</mo></mover></mrow><mn>3</mn></mfrac></math>`,
                    labelD: `<math className="font-semibold text-xl mr-2"><mfrac><mrow><mover><mi>a</mi><mo accent="true">→</mo></mover><mo>+</mo><mn>2</mn><mover><mi>b</mi><mo accent="true">→</mo></mover></mrow><mn>2</mn></mfrac></math>`,
                    labelE: `<math className="font-semibold text-xl mr-2"><mfrac><mrow><mn>2</mn><mover><mi>a</mi><mo accent="true">→</mo></mover><mo>+</mo><mover><mi>b</mi><mo accent="true">→</mo></mover></mrow><mn>3</mn></mfrac></math>`,
                    img: "/14a35.png",
                    answer: ""
                },
                {
                    id: "36",
                    text: `<p><math className="font-semibold text-xl mr-2"><mn>y</mn><mo>=</mo><mn>a</mn><msup><mn>x</mn><mn>2</mn></msup></math> парабол y = ax + 1 шулуунтай яг хоёр цэгээр огтлолцдог байх a − ийн бүх бодит тоон утгыг олонлогийг ол.</p>`,
                    labelA: "]−∞; −4[ ∪ ]0;∞[",
                    labelB: "]−∞; −4] ∪ [0;∞[",
                    labelC: "[−4; 0]",
                    labelD: "]−∞; 0] ∪ [4; ∞[",
                    labelE: "]−∞; 0[ ∪ ]4; ∞[",
                    answer: ""
                },   
            ]
};

export default task2020A;