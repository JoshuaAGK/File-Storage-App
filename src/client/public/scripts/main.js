window.addEventListener("load", async () => {
    const table = document.querySelector("#table");
    if (!table) {
        return;
    }

    const allfiles = await axios.get("/api/getfiles");

    const fileInput = document.querySelector("#file-input");

    for (const file of allfiles.data) {
        /* html */
        const newRow = `<tr id=${file._id}>
            <td>${file.fileName}</td>
            <td>${formatBytes(file.size)}</td>
            <td>${formatDateString(file.uploadedOn)}</td>
            <td>
                <button class="inline-button" onclick="getShareLink(this)">
                    <img src="/media/images/fontawesome/arrow-up-from-bracket-solid.svg"/>
                </button>
                <button class="inline-button" onclick="downloadFile(this)">
                    <img src="/media/images/fontawesome/download-solid.svg"/>
                </button>
                <button class="inline-button" onclick="deleteFile(this)">
                    <img src="/media/images/fontawesome/trash-can-solid.svg"/>
                </button>
                <button class="inline-button" onclick="setPassword(this)">
                    <img src="/media/images/fontawesome/lock-solid.svg"/>
                </button>
            </td>
        </tr>`;
        table.innerHTML += newRow;
    }

    fileInput.onchange = () => {
        const token = getCookie("jwt");
        const jwt = decodeJWT(token);

        const file = fileInput.files[0];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('uid', jwt.uid);
        formData.append('teamName', jwt.teamName);

        axios.post("/api/uploadfile", formData);
        location.reload();
    };
});

function decodeJWT(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    let sizeIndex = 0;
    
    while (bytes >= 1000 && sizeIndex < sizes.length - 1) {
        bytes /= 1000;
        sizeIndex++;
    }

    const formattedSize = bytes.toFixed(2);
    const integerPart = parseInt(formattedSize);
    const decimalPart = parseFloat(formattedSize) - integerPart;

    if (decimalPart == 0) {
        return `${integerPart} ${sizes[sizeIndex]}`;
    } else {
        return `${parseFloat(formattedSize)} ${sizes[sizeIndex]}`;
    }
}

function formatDateString(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function downloadFile(that, passhash = null) {
    if (typeof that === "string") {
        that = { id: that };
    } else {
        that = that.parentElement.parentElement;
    }
    
    const fileID = that.id;
    const result = await axios.get(`/api/getfile/${fileID}?passhash=${passhash}`, { responseType: "blob" });

    const contentHeader = result.headers["content-disposition"];
    const fileName = contentHeader.substring(contentHeader.indexOf('filename=\"') + 10, contentHeader.lastIndexOf('\"'));


    const url = window.URL.createObjectURL(new Blob([result.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
}

async function uploadFile() {
    document.querySelector("#file-input").click();
}

async function deleteFile(that) {
    that = that.parentElement.parentElement;

    const result = await axios.post(`/api/deletefile/${that.id}`);

    const deleteRow = document.getElementById(that.id);
    deleteRow.remove();

}

async function setPassword(that) {
    that = that.parentElement.parentElement;

    let result = await axios.get(`/api/passhash/${that.id}`);
    const newPassword = window.prompt(`Enter new file password\nCurrent password hash (SHA-256):\n${result.data || "No password set"}`);
    const newPasshash = newPassword ? await createHash(newPassword) : "";

    result = await axios.post(`/api/passhash/${that.id}`, {
        passhash: newPasshash
    });
}

async function getShareLink(that) {
    that = that.parentElement.parentElement;

    const result = await axios.get(`/api/passhash/${that.id}`);

    const passhash = result.data;

    let shareLink = `http://localhost:3000/getfile/${that.id}`;
    if (passhash) {
        shareLink += `?passhash=${passhash}`;
    }

    await navigator.clipboard.writeText(shareLink);

    alert("Copied link to clipboard");
}

async function createHash(string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hash;
}

async function login() {
    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;

        const passhash = await createHash(password);
        const formData = { email, passhash };

        const result = await axios.post("/api/login", formData, {
            validateStatus: false
        })

        switch (result.status) {
            case 200:
            case 301:
                document.cookie = `jwt=${result.data}; expires=Fri, 31 Dec 9999 23:59:59 UTC; path=/`;
                window.location.href = "/app";
                break;
            case 401:
                alert("Incorrect password");
                break;
            default:
                alert("Unable to authorise user");
        }
}

async function register() {
    const email = document.querySelector("#register-email").value;
    const password = document.querySelector("#register-password").value;
    const fname = document.querySelector("#register-fname").value;
    const lname = document.querySelector("#register-lname").value;
    const passhash = await createHash(password);

    const formData = { fname, lname, email, passhash };

    const result = await axios.post("/api/signup", formData, {
        validateStatus: false
    })


    switch (result.status) {
        case 200:
        case 301:
            document.cookie = `jwt=${result.data}; expires=Fri, 31 Dec 9999 23:59:59 UTC; path=/`;
            window.location.href = "/app";
            break;
        case 401:
            alert("Incorrect password");
            break;
        default:
            alert("Unable to authorise user");
    }
}

function deleteCookie(cookieName) {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

async function logout() {   
    const result = await axios.post("/api/logout", {}, {
        validateStatus: false
    })

    if (result.status === 301) {
        deleteCookie("jwt");
        window.location.href = result.data;
    }
}