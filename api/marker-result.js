// Poll Datalab for the conversion result
// Returns { status: 'pending' } or { status: 'complete', markdown }
export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end()

    if (!process.env.DATALAB_API_KEY)
        return res.status(503).json({ error: 'DATALAB_API_KEY not set.' })

    const { check_url } = req.query
    if (!check_url) return res.status(400).json({ error: 'Missing check_url.' })

    try {
        const response = await fetch(check_url, {
            headers: { 'X-Api-Key': process.env.DATALAB_API_KEY },
        })
        const data = await response.json()

        if (data.status === 'complete')
            return res.status(200).json({ status: 'complete', markdown: data.markdown })

        return res.status(200).json({ status: data.status || 'pending' })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
