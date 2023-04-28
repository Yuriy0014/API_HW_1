import express from 'express'

const app = express()
const port = 2804

const jsonBodyMW = express.json()
app.use(jsonBodyMW)

const isItNotString = (value: any) => {
    return typeof value !== 'string'
}

const notCorrectResolutions = (arr: Array<string>) => {
    let correctResolutions = ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160']
    return arr.reduce(function (answer, item) {
        return correctResolutions.indexOf(item) === -1 ? answer + 1 : answer
    }, 0)

}
const isNotDate = (date: string) => {
    return (String(new Date(date)) === "Invalid Date") || isNaN(+(new Date(date)));
}


let db = {
    videos: [
        {
            "id": 0,
            "title": "Cats dance",
            "author": "Durov",
            "canBeDownloaded": true,
            "minAgeRestriction": null,
            "createdAt": "2023-04-28T13:43:09.149Z",
            "publicationDate": "2023-04-28T13:43:09.149Z",
            "availableResolutions": [
                "P144"
            ]
        },
        {
            "id": 1,
            "title": "Dogs dance",
            "author": "Mask",
            "canBeDownloaded": true,
            "minAgeRestriction": null,
            "createdAt": "2023-05-28T13:43:09.149Z",
            "publicationDate": "2023-05-28T13:43:09.149Z",
            "availableResolutions": [
                "P144"
            ]
        },
        {
            "id": 2,
            "title": "Stalker lets play",
            "author": "Mecheniy",
            "canBeDownloaded": true,
            "minAgeRestriction": null,
            "createdAt": "2023-03-28T13:43:09.149Z",
            "publicationDate": "2023-03-28T13:43:09.149Z",
            "availableResolutions": [
                "P144"
            ]
        }
    ]
}

export const STATUSES_HTTP = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404
}

app.get('/videos', (req, res) => {
    let foundVideos = db.videos

    if (req.query.title) {
        foundVideos = db.videos
            .filter(c => c.title.indexOf(req.query.title as string) !== -1)
    }

    if (!foundVideos.length) {
        res.status(STATUSES_HTTP.NOT_FOUND_404)
            .json(foundVideos);
        return;
    }

    res.status(STATUSES_HTTP.OK_200)
        .json(foundVideos)
})

app.post('/videos', (req, res) => {

    let createdAt = new Date().toISOString();
    let publicationDate = new Date(createdAt)
    publicationDate.setDate(publicationDate.getDate() + 1);


    if (isItNotString(req.body.title) || isItNotString(req.body.author) || (req.body.title ? req.body.title.length > 40 : 0) || (req.body.author ? req.body.author.length > 20 : 0)  || notCorrectResolutions(req.body.availableResolutions)) {
        let errorsMessages = [];
        if (isItNotString(req.body.title) || req.body.title.length > 40) {
            let titleErrorMessage = {
                "message": "Title is incorrect",
                "field": "title"
            }
            errorsMessages.push(titleErrorMessage)
        }
        if (isItNotString(req.body.author) || req.body.author.length > 20) {
            let titleErrorMessage = {
                "message": "Author is incorrect",
                "field": "author"
            }
            errorsMessages.push(titleErrorMessage)
        }
        if (notCorrectResolutions(req.body.availableResolutions)) {
            let titleErrorMessage = {
                "message": "availableResolutions contains unavailable value",
                "field": "availableResolutions"
            }
            errorsMessages.push(titleErrorMessage)
        }

        res.status(STATUSES_HTTP.BAD_REQUEST_400)
            .json(errorsMessages)
        return;
    }

    const createdVideo = {
        "id": +(new Date),
        "title": req.body.title,
        "author": req.body.author,
        "canBeDownloaded": false,
        "minAgeRestriction": null,
        "createdAt": createdAt,
        "publicationDate": publicationDate.toISOString(),
        "availableResolutions": req.body.availableResolutions
    }

    db.videos.push(createdVideo)

    res.status(STATUSES_HTTP.CREATED_201)
        .json(createdVideo)
})

app.get('/videos/:id', (req, res) => {
    const foundVideo = db.videos.find(c => c.id === +req.params.id)

    if (!foundVideo) {
        res.sendStatus(STATUSES_HTTP.NOT_FOUND_404)
        return;
    }

    res.json(foundVideo)
})

app.put('/videos/:id', (req, res) => {

        if (isItNotString(req.body.title) || isItNotString(req.body.author) || req.body.title.length > 40 || req.body.author.length > 20
            || notCorrectResolutions(req.body.availableResolutions) || typeof (req.body.canBeDownloaded !== "boolean")
            || (typeof (req.body.minAgeRestriction !== "integer") && req.body.minAgeRestriction > 0 && req.body.minAgeRestriction < 19)
            || (isItNotString(req.body.publicationDate) && isNotDate(req.body.publicationDate))) {
            let errorsMessages = [];
            if (isItNotString(req.body.title) || req.body.title.length > 40) {
                let titleErrorMessage = {
                    "message": "Title is incorrect",
                    "field": "Title"
                }
                errorsMessages.push(titleErrorMessage)
            }
            if (isItNotString(req.body.author) || req.body.author.length > 20) {
                let titleErrorMessage = {
                    "message": "Author is incorrect",
                    "field": "Author"
                }
                errorsMessages.push(titleErrorMessage)
            }
            if (notCorrectResolutions(req.body.availableResolutions)) {
                let titleErrorMessage = {
                    "message": "availableResolutions contains unavailable value",
                    "field": "availableResolutions"
                }
                errorsMessages.push(titleErrorMessage)
            }
            if (typeof (req.body.canBeDownloaded !== "boolean")) {
                let titleErrorMessage = {
                    "message": "canBeDownloaded is not boolean",
                    "field": "canBeDownloaded"
                }
                errorsMessages.push(titleErrorMessage)
            }
            if ((typeof (req.body.minAgeRestriction !== "integer") && req.body.minAgeRestriction > 0 && req.body.minAgeRestriction < 19)) {
                let titleErrorMessage = {
                    "message": "minAgeRestriction is not correct",
                    "field": "minAgeRestriction"
                }
                errorsMessages.push(titleErrorMessage)
            }
            if ((isItNotString(req.body.publicationDate) && isNotDate(req.body.publicationDate))) {
                let titleErrorMessage = {
                    "message": "publicationDate is not correct",
                    "field": "publicationDate"
                }
                errorsMessages.push(titleErrorMessage)
            }

            res.status(STATUSES_HTTP.BAD_REQUEST_400)
                .json(errorsMessages)
            return;

        }
        const foundVideo = db.videos.find(c => c.id === +req.params.id);

        if (!foundVideo) {
            res.sendStatus(STATUSES_HTTP.NOT_FOUND_404)
            return;
        }

        foundVideo.title = req.body.title;
        foundVideo.author = req.body.author;
        foundVideo.availableResolutions = req.body.availableResolutions;
        foundVideo.canBeDownloaded = req.body.canBeDownloaded;
        foundVideo.minAgeRestriction = req.body.minAgeRestriction;
        foundVideo.publicationDate = req.body.publicationDate;

        res.sendStatus(STATUSES_HTTP.NO_CONTENT_204)
    }
)

app.delete('/videos/:id', (req, res) => {
    const foundVideo = db.videos.find(c => c.id === +req.params.id)

    if (!foundVideo) {
        res.sendStatus(STATUSES_HTTP.NOT_FOUND_404)
        return;
    }

    db.videos = db.videos.filter(c => c.id !== +req.params.id)

    res.sendStatus(STATUSES_HTTP.NO_CONTENT_204)
})

app.delete('/testing/all-data', (req, res) => {
    db.videos = [];
    res.sendStatus(STATUSES_HTTP.NO_CONTENT_204)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})