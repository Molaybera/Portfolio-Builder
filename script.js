let selectedTemplate = null;

// Select a template
function selectTemplate(templateId) {
    selectedTemplate = templateId;
    
    // Remove previous selection
    document.querySelectorAll('.template').forEach(t => t.classList.remove('selected'));

    // Highlight selected template
    document.querySelector(`.template:nth-child(${templateId})`).classList.add('selected');
}

// download Portfolio
function generatePreview() {
    if (!selectedTemplate) {
        alert("Please select a template first!");
        return;
    }

    let previewFrame = document.getElementById('preview-frame');
    let templatePath = `templates/template${selectedTemplate}.html`;
    let cssPath = `templates/css/template${selectedTemplate}.css`;

    previewFrame.src = templatePath;

    previewFrame.onload = function () {
        let iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;

        if (!iframeDoc) {
            console.error("Failed to access iframe document!");
            return;
        }

        iframeDoc.getElementById('portfolio-name').innerText = document.getElementById('name').value;
        iframeDoc.getElementById('portfolio-bio').innerText = document.getElementById('bio').value;
        iframeDoc.getElementById('portfolio-skills').innerText = document.getElementById('skills').value;
        iframeDoc.getElementById('portfolio-projects').innerText = document.getElementById('projects').value;

        // Set Social Link Dynamically
        let socialLink = document.getElementById('social').value;
        let socialElement = iframeDoc.getElementById('portfolio-social');

        if (socialLink) {
            socialElement.href = socialLink;
            socialElement.innerText = "Social-Link";
        } else {
            socialElement.href = "#";
            socialElement.innerText = "No Social Link Provided";
        }

        // Load Profile Picture
        let file = document.getElementById('profile-pic').files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (event) {
                iframeDoc.getElementById('portfolio-pic').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('preview-section').style.display = 'block';
}

// download Portfolio
function downloadPortfolio() {
    if (!selectedTemplate) {
        alert("Please select a template first!");
        return;
    }

    let userData = {
        name: document.getElementById('name').value,
        bio: document.getElementById('bio').value,
        skills: document.getElementById('skills').value,
        projects: document.getElementById('projects').value,
        social: document.getElementById('social').value
    };

    let templatePath = `templates/template${selectedTemplate}.html`;
    let cssPath = `templates/template${selectedTemplate}.css`;

    console.log("Downloading portfolio...");

    Promise.all([
        fetch(templatePath).then(res => res.ok ? res.text() : Promise.reject("Template file not found!")),
        fetch(cssPath).then(res => res.ok ? res.text() : Promise.reject("CSS file not found!"))
    ])
    .then(([htmlContent, cssContent]) => {
        //  Remove script tags before saving
        htmlContent = htmlContent.replace(/<script[\s\S]*?<\/script>/gi, "");

        //  Replace placeholders with user data
        htmlContent = htmlContent.replace(/{name}/g, userData.name)
                                 .replace(/{bio}/g, userData.bio)
                                 .replace(/{skills}/g, userData.skills)
                                 .replace(/{projects}/g, userData.projects)
                                 .replace(/{social}/g, `href="${userData.social}" target="_blank"`);

        let zip = new JSZip();
        zip.file(`template${selectedTemplate}.html`, htmlContent);
        zip.file(`template${selectedTemplate}.css`, cssContent);

        //  Handle profile picture
        let fileInput = document.getElementById('profile-pic');
        let file = fileInput.files[0];

        if (file) {
            let reader = new FileReader();
            reader.onload = function (event) {
                let base64Data = event.target.result.split(',')[1];
                let byteCharacters = atob(base64Data);
                let byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                let byteArray = new Uint8Array(byteNumbers);
                zip.file("profile-pic.png", byteArray, { binary: true });

                zip.generateAsync({ type: "blob" }).then(content => {
                    let link = document.createElement("a");
                    link.href = URL.createObjectURL(content);
                    link.download = `portfolio_template${selectedTemplate}.zip`;
                    link.click();
                });
            };
            reader.readAsDataURL(file);
        } else {
            zip.generateAsync({ type: "blob" }).then(content => {
                let link = document.createElement("a");
                link.href = URL.createObjectURL(content);
                link.download = `portfolio_template${selectedTemplate}.zip`;
                link.click();
            });
        }
    })
    .catch(error => {
        console.error("Error downloading portfolio:", error);
        alert(error);
    });
}