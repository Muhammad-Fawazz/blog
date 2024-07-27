const createButton = document.querySelector("header button");

const createBlog = (link, title, description) => {
    // Create elements for the blog post
    let h2 = document.createElement("h2");
    h2.innerText = title;

    let p = document.createElement("p");
    p.innerText = description;

    // Create "Read more" button with link
    const readMoreLink = document.createElement("a");
    readMoreLink.href = link;
    readMoreLink.target = "_blank";  // Open link in new tab
    const readMoreButton = document.createElement("button");
    readMoreButton.innerText = "Read more";
    readMoreButton.classList.add("read-btn");
    readMoreLink.appendChild(readMoreButton);

    // Create edit button with class for styling
    const editButton = document.createElement("button");
    editButton.innerText = "Edit";
    editButton.classList.add("edit-btn");

    // Create delete button with class for styling
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.classList.add("delete-btn");

    // Create container for buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(readMoreLink);
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    // Create article element and append all the elements to it
    const article = document.createElement("article");
    article.classList.add("blog-post");
    article.appendChild(h2);
    article.appendChild(p);
    article.appendChild(buttonContainer);

    // Append the article to the blog container
    document.querySelector(".blog-container").appendChild(article);

    // Add event listener to delete button
    deleteButton.addEventListener("click", () => {
        article.remove();
    });

    // Add event listener to edit button
    editButton.addEventListener("click", () => {
        const newLink = prompt("Edit blog link", link);
        const newTitle = prompt("Edit blog title", title);
        const newDescription = prompt("Edit blog description", description);
        if (newTitle) h2.innerText = newTitle;
        if (newDescription) p.innerText = newDescription;
        if (newLink) readMoreLink.href = newLink;
    });
};

createButton.addEventListener("click", () => {
    // Prompt user for blog details
    const link = prompt("Enter the blog link to create it");
    const title = prompt("Enter blog title");
    const description = prompt("Enter blog description");

    createBlog(link, title, description);
});


