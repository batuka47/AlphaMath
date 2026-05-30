// Task.jsx — master index for all ЭЕШ test data
// Generated from PDF extraction + original data
// Files with ✅ questions + answers | ⚠️ partial | 📋 stub only

import task2006A from './years/task2006A.js';
import task2006B from './years/task2006B.js';
import task2006C from './years/task2006C.js';
import task2006D from './years/task2006D.js';
import task2007A from './years/task2007A.js';
import task2007B from './years/task2007B.js';
import task2007C from './years/task2007C.js';
import task2007D from './years/task2007D.js';
import task2008A from './years/task2008A.js';
import task2008B from './years/task2008B.js';
import task2008C from './years/task2008C.js';
import task2008D from './years/task2008D.js';
import task2009A from './years/task2009A.js';
import task2009B from './years/task2009B.js';
import task2009C from './years/task2009C.js';
import task2009D from './years/task2009D.js';
import task2010A from './years/task2010A.js';
import task2010B from './years/task2010B.js';
import task2010C from './years/task2010C.js';
import task2010D from './years/task2010D.js';
import task2011A from './years/task2011A.js';
import task2011B from './years/task2011B.js';
import task2011C from './years/task2011C.js';
import task2011D from './years/task2011D.js';
import task2012A from './years/task2012A.js';
import task2012B from './years/task2012B.js';
import task2012C from './years/task2012C.js';
import task2012D from './years/task2012D.js';
import task2013A from './years/task2013A.js';
import task2013B from './years/task2013B.js';
import task2013C from './years/task2013C.js';
import task2013D from './years/task2013D.js';
import task2014A from './years/task2014A.js';
import task2014B from './years/task2014B.js';
import task2014C from './years/task2014C.js';
import task2014D from './years/task2014D.js';
import task2015A from './years/task2015A.js';
import task2015B from './years/task2015B.js';
import task2015C from './years/task2015C.js';
import task2015D from './years/task2015D.js';
import task2016A from './years/task2016A.js';
import task2016B from './years/task2016B.js';
import task2016C from './years/task2016C.js';
import task2016D from './years/task2016D.js';
import task2017A from './years/task2017A.js';
import task2017B from './years/task2017B.js';
import task2017C from './years/task2017C.js';
import task2017D from './years/task2017D.js';
import task2018A from './years/task2018A.js';
import task2018B from './years/task2018B.js';
import task2018C from './years/task2018C.js';
import task2018D from './years/task2018D.js';
import task2019A from './years/task2019A.js';
import task2019B from './years/task2019B.js';
import task2019C from './years/task2019C.js';
import task2019D from './years/task2019D.js';
import task2020A from './years/task2020A.js';
import task2020B from './years/task2020B.js';
import task2020C from './years/task2020C.js';
import task2020D from './years/task2020D.js';
import task2021A from './years/task2021A.js';
import task2021B from './years/task2021B.js';
import task2021C from './years/task2021C.js';
import task2021D from './years/task2021D.js';
import task2022A from './years/task2022A.js';
import task2022B from './years/task2022B.js';
import task2022C from './years/task2022C.js';
import task2022D from './years/task2022D.js';
import task2023A from './years/task2023A.js';
import task2023B from './years/task2023B.js';
import task2023C from './years/task2023C.js';
import task2023D from './years/task2023D.js';
import task2024A from './years/task2024A.js';
import task2024B from './years/task2024B.js';
import task2024C from './years/task2024C.js';
import task2024D from './years/task2024D.js';

function Task() {
    const all = [
        task2006A,
        task2006B,
        task2006C,
        task2006D,
        task2007A,
        task2007B,
        task2007C,
        task2007D,
        task2008A,
        task2008B,
        task2008C,
        task2008D,
        task2009A,
        task2009B,
        task2009C,
        task2009D,
        task2010A,
        task2010B,
        task2010C,
        task2010D,
        task2011A,
        task2011B,
        task2011C,
        task2011D,
        task2012A,
        task2012B,
        task2012C,
        task2012D,
        task2013A,
        task2013B,
        task2013C,
        task2013D,
        task2014A,
        task2014B,
        task2014C,
        task2014D,
        task2015A,
        task2015B,
        task2015C,
        task2015D,
        task2016A,
        task2016B,
        task2016C,
        task2016D,
        task2017A,
        task2017B,
        task2017C,
        task2017D,
        task2018A,
        task2018B,
        task2018C,
        task2018D,
        task2019A,
        task2019B,
        task2019C,
        task2019D,
        task2020A,
        task2020B,
        task2020C,
        task2020D,
        task2021A,
        task2021B,
        task2021C,
        task2021D,
        task2022A,
        task2022B,
        task2022C,
        task2022D,
        task2023A,
        task2023B,
        task2023C,
        task2023D,
        task2024A,
        task2024B,
        task2024C,
        task2024D,
    ];
    // Filter out empty stubs — only return tests with at least 5 questions
    return all.filter(t => t.problem && t.problem.length >= 5);
}

export default Task;