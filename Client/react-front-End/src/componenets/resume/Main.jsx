import ResumeScoreCard from "./ResumeScoreCard";

export default function Main() {
    const tone = 100;
    const content = 25;
    const structure = 70;
    const skills = 32;

    return (
    <div>
        <ResumeScoreCard tone={tone} content={content} structure={structure} skills={skills} />
        <div className="suggestions">
            <div className={`resume-score-badge ${tone >= 70 ? 'good' : tone >= 50 ? 'start' : 'bad'}`}>
                <h2>Tone & Style Analysis</h2>
                <p>Your resume's tone and style are crucial for making a good impression.</p>
            </div>
            <div className={`resume-score-badge ${content >= 70 ? 'good' : content >= 50 ? 'start' : 'bad'}`}>
                <h2>Content Analysis</h2>
                <p>Your resume's content should be clear, concise, and relevant to the job you're applying for.</p>
            </div>
            <div className={`resume-score-badge ${structure >= 70 ? 'good' : structure >= 50 ? 'start' : 'bad'}`}>
                <h2>Structure Analysis</h2>
                <p>Your resume's structure should be logical and easy to follow, with clear headings and sections.</p>
            </div>
            <div className={`resume-score-badge ${skills >= 70 ? 'good' : skills >= 50 ? 'start' : 'bad'}`}>
                <h2>Skills Analysis</h2>
                <p>Your resume should highlight your relevant skills and experiences effectively.</p>
            </div>
        </div>
    </div>
    );
}