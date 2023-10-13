        let visibleElements = [];
        const elements = [];
        const Person = {
            name: 'Jan',
            surname: 'Kowalski',
            title: 'Pan',
            print: function () { return `${this.title} ${this.name} ${this.surname}`; }
        }

        const updateState = (el, isIntersecting, number) => {
            if (!number) return; 
            if (isIntersecting) { 
                if (!el.classList.contains('ex-1-element-visible'))
                    el.classList.add('ex-1-element-visible');
                if (!visibleElements.some(ve => ve == el.dataset.number)) 
                    visibleElements.push(el.dataset.number);
            }
            else {
                // el.classList.remove('ex-1-element-visible');
                visibleElements = visibleElements.filter(a => a != el.dataset.number);
            }  

            visibleElements.sort((a,b) => a-b);
            const ex1pointer = document.querySelector('#ex-1-pointer');
            ex1pointer.innerHTML = visibleElements.map(a => a.toString().padStart(3, ' ')).join('|');
        }

        const callbackVisible = (entries) => {
            entries.map(e => updateState(e.target, e.isIntersecting, e.target?.dataset?.number));
        }

        const buildEx1Elements = (ex1) => {
            const person = Object.create(Person); // dostępne surname z prototype
            for (let i = 0; i < 50; i++) {
                let p = structuredClone(person); // nie kopiuje surname z prototype
                // if (i % 2) p = structuredClone(Person);// nie kopiuje, bo jest funkcja
                p.title = i % 2 ? 'Mr' : 'Mrs';
                p.name = i % 2 ? 'John' : 'Janine';
                p.id = i + 1;
                
                const dPerson = buildPersonElement(p);
                ex1.append(dPerson);
                elements.push(dPerson);
                obs.observe(dPerson);
            }
        }

        function buildPersonElement(p) {
            const dPerson = document.createElement('div');
            dPerson.setAttribute('id', `el-${p.id}`)                
            dPerson.dataset.number = p.id;
            dPerson.classList.add('ex-1-element');
            dPerson.dataset.gender = p.title == 'Mrs' ? 'female' : 'male'; 

            const dName = document.createElement('div');
            dName.dataset.field = 'name';
            dName.innerText = p.name;

            const dSurname = document.createElement('div');
            dSurname.dataset.field = 'surname';
            dSurname.innerText = p.surname ?? 'Smith';

            const dId = document.createElement('div');
            dId.dataset.field = 'id';
            dId.innerText = p.id;

            dPerson.append(dName);
            dPerson.append(dSurname);
            dPerson.append(dId);

            return dPerson;
        }

        const buildEx1 = () => {
            const ex1 = document.querySelector('#ex-1');
            buildEx1Elements(ex1);

            const ex1pointer = document.querySelector('#ex-1-pointer');
            ex1pointer.addEventListener('click', function(e) {
                const ex1 = document.querySelector('#ex-1');
                if (ex1.childNodes.length > 5) {
                    e.target.style.position = 'absolute';
                    elements.forEach(el => {
                        obs.unobserve(el);
                        el.remove();
                    });
                    visibleElements.length = 0;
                    document.querySelector('#ex-1-pointer').innerHTML = 'Rebuild Ex.1.';
                }
                else {
                    e.target.style.position = 'fixed';
                    buildEx1Elements(ex1);
                }                
            })            
        }
        const obs = new IntersectionObserver(callbackVisible, { threshold: 0.5 });

        function buildNavi() {
            document.querySelector('#scrollToTop').
                addEventListener('click', 
                function() { 
                    document.querySelector('.title').
                        scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 
                false
                );
            document.querySelector('#scrollToBottom').
                addEventListener('click', 
                function() { 
                    document.querySelector('.bottom').
                        scrollIntoView({ behavior: "smooth", block: "end" })
                 }, 
                false
            );
            document.querySelector('#printPage').
                addEventListener('click', function() { window.print(); }, false );
            document.querySelector('#recordPage').
                addEventListener('click', function() { recordPage(); }, false );
            document.querySelector('#enterFullScreen').
                addEventListener('click', function() { enterFullScreen(); }, false );
            document.querySelector('#exitFullScreen').
                addEventListener('click', function() { exitFullScreen(); }, false );
        }

        function recordPage() {
            const streamPromise = navigator.mediaDevices.getDisplayMedia()
            streamPromise.then(stream => {
                var recordedChunks = [];// recorded video data
            var options = { mimeType: "video/webm; codecs=vp9" };// Set the encoding format
                var mediaRecorder = new MediaRecorder(stream, options);// Initialize the MediaRecorder instance
                mediaRecorder.ondataavailable = handleDataAvailable;// Set the callback when data is available (end of screen recording)
                mediaRecorder.start();
                // Video Fragmentation
                function handleDataAvailable(event) {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);// Add data, event.data is a BLOB object
                        download();// Encapsulate into a BLOB object and download
                    }
                }
                // file download
                function download() {
                    var blob = new Blob(recordedChunks, {
                        type: "video/webm"
                    });
                    // Videos can be uploaded to the backend here
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    a.href = url;
                    a.download = "test.webm";
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
            })            
        }

        function enterFullScreen() {  
            const el = document.documentElement
            const rfs = 
                el.requestFullScreen || 
                el.webkitRequestFullScreen || 
                el.mozRequestFullScreen || 
                el.msRequestFullscreen;
            if(typeof rfs != "undefined" && rfs) {
                rfs.call(el)
            }
        }

        function exitFullScreen() {
            if (document.exitFullscreen) { 
                document.exitFullscreen()
            } 
            else if (document.mozCancelFullScreen) { 
                document.mozCancelFullScreen()
            } 
            else if (document.webkitCancelFullScreen) { 
                document.webkitCancelFullScreen()
            } 
            else if (document.msExitFullscreen) { 
                document.msExitFullscreen()
            } 
            if(typeof cfs != "undefined" && cfs) {
                cfs.call(el)
            }
        }        

        const {hidden, visibilityChange} = (() => {
            let hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
            }
            return {
                hidden,
                visibilityChange
            }
        })();

        const handleVisibilityChange = () => {
            console.log(`became ${document[hidden] ? 'HIDDEN' : 'VISIBLE'} at ${new Date().toLocaleTimeString()}`);
        };  
        
        const getObjectURL = (file) => {
            let url = null;
            if (window.createObjectURL != undefined) { // basic
                url = window.createObjectURL(file);
            } else if (window.URL != undefined) { // webkit or chrome
                url = window.URL.createObjectURL(file);
            } else if (window.URL != undefined) { // mozilla(firefox)
                url = window.URL.createObjectURL(file);
            }
            return url;
        }      

        window.onload = function() {
            buildEx1();
            buildNavi();

            document.addEventListener(visibilityChange,handleVisibilityChange,false);
        
            document.querySelector('#ex-2 input').addEventListener('change', (event) => {
                document.querySelector('#ex-2 img').src = getObjectURL(event.target.files[0])
            });             
        }