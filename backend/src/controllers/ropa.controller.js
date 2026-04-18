const supabase = require('../lib/supabaseClient')

exports.getRapo = async (req, res) => {
    const { data, error } = await supabase
        .from('rapo')
        .select('*')

    console.log("data:", data)
    console.log("error:", error)

    if (error) {
        return res.status(500).json(error)
    }

    res.json(data)
}