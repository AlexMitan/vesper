block targeting
    getnearest
    if enemy return attack
    if ally return assist

func targeting (entity)
    nearest = getnearest(entity)
    if (nearest == enemy)
        return attack
    if (nearest == ally)
        return assist

(func targeting (entity)
    (= nearest (getnearest entity))
    (if (== nearest ally)
        (return attack)
        (if (== nearest enemy)
            (return assist))))


(defun mortar-targeting
    (= enemies get_enemies)
    )