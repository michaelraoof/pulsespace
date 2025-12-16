import moment from "moment";


const calculateTime = (createdAt, isComment) => {
  const today = moment(Date.now());
  const postDate = moment(createdAt);
  const diffInWeeks = today.diff(postDate, "weeks");
  const diffInDays = today.diff(postDate, "days");
  const diffInHours = today.diff(postDate, "hours");
  const diffInMinutes = today.diff(postDate, "minutes");
  const diffInSeconds = today.diff(postDate, "seconds");

  if (diffInMinutes < 1) {
    return `${diffInSeconds} s`;
  }

  if (diffInHours < 1) {
    return `${diffInMinutes} m`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} h`;
    // return (
    //   <>
    //     {/* hh:mm A -> hours:minutes AM/PM */}
    //     Today, {moment(createdAt).format("hh:mm A")}
    //   </>
    // );
  } else if (diffInHours >= 24 && diffInHours < 36) {
    if (isComment) {
      return `${diffInDays} d`;
    }
    return (
      <>
        Yesterday, {moment(createdAt).format("HH:mm")}
      </>
    );
  } else if (diffInHours >= 36 && diffInHours < 168) {
    if (isComment) {
      return `${diffInDays} d`;
    }
    return (
      <>
        {/* date/month/year along with time */}
        {moment(createdAt).format("DD MMM YYYY, HH:mm")}
      </>
    );
  } else if (diffInHours >= 168) {
    if (isComment) {
      return `${diffInWeeks} w`;
    }
    return (
      <>
        {/* date/month/year along with time */}
        {moment(createdAt).format("DD MMM YYYY, HH:mm")}
      </>
    );
  }
};

export default calculateTime;
