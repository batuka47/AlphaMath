// Submit a PDF to the Datalab Marker API
// Returns { check_url } for the browser to poll
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    if (!process.env.DATALAB_API_KEY)
        return res.status(503).json({ error: 'DATALAB_API_KEY not set in environment variables.' })

    const { pdf, filename = 'exam.pdf' } = req.body || {}
    if (!pdf) return res.status(400).json({ error: 'Missing pdf (base64).' })

    try {
        const form = new FormData()
        form.append('file', new Blob([Buffer.from(pdf, 'base64')], { type: 'application/pdf' }), filename)
        form.append('langs', 'English,Mongolian')
        form.append('output_format', 'markdown')

        const response = await fetch('https://www.datalab.to/api/v1/marker', {
            method:  'POST',
            headers: { 'X-Api-Key': process.env.DATALAB_API_KEY },
            body:    form,
        })

        const data = await response.json()

        if (!response.ok || !data.success)
            return res.status(500).json({ error: data.error || 'Datalab submission failed.' })

        return res.status(200).json({ check_url: data.request_check_url })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } }
