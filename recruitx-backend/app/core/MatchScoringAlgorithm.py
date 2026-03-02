import math


class AdvancedPlacementRankingModel:
    """
    multi-dimensional weighted compatibility engine
    using normalized academic vectors and skill similarity metrics.
    """

    WEIGHT_VECTOR = {
        "academics": 0.45,
        "skills": 0.30,
        "experience": 0.15,
        "stability": 0.10
    }

    @staticmethod
    def min_max_normalize(value, min_threshold, max_cap=10):
        """
        Applies capped min-max normalization.
        """
        if min_threshold is None or min_threshold == 0:
            return 0
        normalized = value / min_threshold
        return min(normalized, 1)

    @staticmethod
    def cosine_skill_similarity(required, student):
        """
        Approximates cosine similarity between skill vectors.
        """

        if not required or not student:
            return 0

        required_set = set(skill.strip().lower() for skill in required.split(","))
        student_set = set(skill.strip().lower() for skill in student.split(","))

        intersection = required_set.intersection(student_set)

        if len(required_set) == 0:
            return 0

        # Cosine-like similarity
        similarity = len(intersection) / math.sqrt(len(required_set) * len(student_set))

        return similarity

    @classmethod
    def compute_composite_score(cls, student, job):
        """
        Multi-dimensional compatibility scoring.
        """

        academic_score = (
            cls.min_max_normalize(student.cgpa, job.min_cgpa) * 0.4 +
            cls.min_max_normalize(student.tenth_percent, job.min_tenth) * 0.3 +
            cls.min_max_normalize(student.twelfth_percent, job.min_twelfth) * 0.3
        )

        skill_score = cls.cosine_skill_similarity(
            job.required_skill,
            student.skills
        )

        experience_score = 1 if (
            job.internship_required and student.internship_experience == "YES"
        ) else 0

        stability_score = 1 if student.backlogs == 0 else 0

        composite_score = (
            academic_score * cls.WEIGHT_VECTOR["academics"] +
            skill_score * cls.WEIGHT_VECTOR["skills"] +
            experience_score * cls.WEIGHT_VECTOR["experience"] +
            stability_score * cls.WEIGHT_VECTOR["stability"]
        )

        return round(composite_score * 100, 2)